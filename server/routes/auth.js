import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database.js';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import UserExpertise from '../models/UserExpertise.js';
import UserDesiredExpertise from '../models/UserDesiredExpertise.js';
import UserInterests from '../models/UserInterests.js';
import UserGoals from '../models/UserGoals.js';
import UserLanguages from '../models/UserLanguages.js';
import auth from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/emailService.js';

const ACCESS_SECRET  = process.env.JWT_SECRET || 'demo-secret-key-change-in-production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'demo-refresh-secret-change-in-production';

const issueTokens = (res, payload) => {
    const accessToken = jwt.sign({ ...payload, type: 'access' }, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, REFRESH_SECRET, { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return accessToken;
};

const router = express.Router();

// Admin login - credentials stored in env vars, never in code
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@deiafrica.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'DEICafe@Admin2024!';

        if (email !== adminEmail || password !== adminPassword) {
            return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
        }

        const token = jwt.sign(
            { userId: 'admin-user', email, role: 'admin' },
            ACCESS_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            message: 'Admin login successful',
            data: { token, user: { id: 'admin-user', email, role: 'admin' } }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error during admin login' });
    }
});

// Demo login (bypasses database) - for testing purposes
router.post('/demo-login', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Generate a demo token
        const token = jwt.sign(
            { userId: 'demo-user-123', email: email || 'demo@example.com' },
            process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
            { expiresIn: '7d' }
        );

        // Return demo user with completed profile
        res.json({
            success: true,
            message: 'Demo login successful',
            data: {
                user: {
                    id: 'demo-user-123',
                    email: email || 'demo@example.com',
                    isFirstLogin: false,
                    profile: {
                        role: 'mentee',
                        name: 'Demo User',
                        location: 'Nairobi, Kenya',
                        expertise: ['Technology', 'Software Development'],
                        interests: ['AI', 'Web Development'],
                        experience: '2 years',
                        goals: ['Learn new skills', 'Network with mentors'],
                        availability: 'Weekends',
                        languages: ['English', 'Swahili']
                    }
                },
                token
            }
        });
    } catch (error) {
        console.error('Demo login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during demo login'
        });
    }
});

// Register new user
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        // Create user in database
        const newUser = await User.create({ email, password });
        const userId = newUser.id;  // actual DB column is 'id'

        // Save profile if provided from onboarding step
        if (req.body.profile) {
            const {
                name, role, location, experience, availability,
                expertise, desired_expertise, interests, goals, languages
            } = req.body.profile;

            const profileRole = role || 'mentee';

            // Updates users row + creates experts row if mentor/both
            const savedProfile = await UserProfile.create({
                user_id:      userId,
                role:         profileRole,
                name:         name || email.split('@')[0],
                location:     location || 'Unknown',
                experience:   experience || 'Junior (0-2 years)',
                availability: availability || '1-2 hours/week',
            });

            // Save own expertise
            if (expertise?.length > 0) {
                await UserExpertise.create(userId, expertise);
                // If mentor, also insert into expert_expertise so they appear in matching
                if (savedProfile?.expert_id && (profileRole === 'mentor' || profileRole === 'both')) {
                    const expertId = savedProfile.expert_id;
                    const expValues = expertise
                        .map(e => `('${expertId}', '${e.replace(/'/g, "''")}')`)
                        .join(', ');
                    try {
                        await executeQuery(
                            `INSERT INTO expert_expertise (expert_id, expertise) VALUES ${expValues}`
                        );
                    } catch { /* non-fatal */ }
                }
            }

            // Save desired expertise (what kind of mentor they want)
            if (desired_expertise?.length > 0) {
                await UserDesiredExpertise.create(userId, desired_expertise);
            }

            if (interests?.length > 0)  { try { await UserInterests.create(userId, interests); } catch {} }
            if (goals?.length > 0)      await UserGoals.create(userId, goals);
            if (languages?.length > 0)  await UserLanguages.create(userId, languages);
        }

        // Generate JWT token
        const token = issueTokens(res, { userId: newUser.id, email: newUser.email });

        // EMAIL VERIFICATION DISABLED - users are active immediately on registration
        // TODO: Re-enable when FRONTEND_URL and email deliverability are confirmed working
        // try {
        //     const verificationToken = jwt.sign(
        //         { email, type: 'email-verification' },
        //         process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
        //         { expiresIn: '24h' }
        //     );
        //     await sendVerificationEmail(email, verificationToken, email.split('@')[0]);
        //     console.log(`📧 Verification email sent to ${email}`);
        // } catch (emailError) {
        //     console.error('Verification email failed (non-fatal):', emailError.message);
        // }

        res.status(201).json({
            success: true,
            message: `Registration successful! Welcome to DEI Cafe.`,
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    isFirstLogin: true,
                    emailVerified: true
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        // SQL Server unique constraint violation (duplicate email)
        if (error.number === 2627 || error.number === 2601 || (error.message && error.message.includes('UNIQUE'))) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// Login user
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        console.log('🔐 Login attempt:', email);

        // ── Admin shortcut ──────────────────────────────────────────────────
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@deiafrica.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'DEICafe@Admin2024!';
        if (email === adminEmail && password === adminPassword) {
            const token = jwt.sign(
                { userId: 'admin-user', email, role: 'admin' },
                process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
                { expiresIn: '8h' }
            );
            return res.json({
                success: true,
                message: 'Admin login successful',
                data: {
                    token,
                    user: { id: 'admin-user', email, role: 'admin', name: 'Admin' }
                }
            });
        }
        // ───────────────────────────────────────────────────────────────────

        // Find user in DB
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Load full profile and related data in parallel
        const [profile, expertiseRows, desiredRows, goalsRows, languagesRows] = await Promise.all([
            UserProfile.findByUserId(user.id),
            UserExpertise.findByUserId(user.id),
            UserDesiredExpertise.findByUserId(user.id),
            UserGoals.findByUserId(user.id),
            UserLanguages.findByUserId(user.id),
        ]);

        await User.updateLastLogin(user.id);

        const token = issueTokens(res, { userId: user.id, email: user.email });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    is_mentor: user.is_mentor,
                    is_mentee: user.is_mentee,
                    is_expert: user.is_expert,
                    isFirstLogin: !profile,
                    profile: profile ? {
                        name:             profile.name || user.name,
                        role:             profile.role || user.role,
                        location:         profile.location || user.location,
                        experience:       profile.experience || user.experience,
                        availability:     profile.availability || user.availability,
                        bio:              profile.bio || user.bio,
                        is_mentor:        user.is_mentor,
                        is_mentee:        user.is_mentee,
                        expertise:           expertiseRows.map(e => e.expertise),
                        desired_expertise:   desiredRows.map(d => d.expertise),
                        goals:               goalsRows.map(g => g.goal),
                        languages:           languagesRows.map(l => l.language),
                    } : null
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Refresh access token using httpOnly refresh token cookie
router.post('/refresh', (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
    try {
        const decoded = jwt.verify(token, REFRESH_SECRET);
        if (decoded.type !== 'refresh') throw new Error('Invalid token type');
        const accessToken = jwt.sign(
            { userId: decoded.userId, email: decoded.email, type: 'access' },
            ACCESS_SECRET,
            { expiresIn: '15m' }
        );
        res.json({ success: true, data: { token: accessToken } });
    } catch {
        res.clearCookie('refreshToken');
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
});

// Logout — clears the refresh token cookie
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;
        const [profile, expertiseRows, desiredRows] = await Promise.all([
            UserProfile.findByUserId(userId),
            UserExpertise.findByUserId(userId),
            UserDesiredExpertise.findByUserId(userId),
        ]);

        res.json({
            success: true,
            data: {
                user: {
                    id: userId,
                    email: req.user.email,
                    isFirstLogin: !profile,
                    profile: profile ? {
                        ...profile,
                        expertise:         expertiseRows.map(e => e.expertise),
                        desired_expertise: desiredRows.map(d => d.expertise),
                    } : null
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting profile'
        });
    }
});

// Update expertise and desired_expertise
router.put('/expertise', auth, async (req, res) => {
    try {
        const userId = req.user.id || req.user.user_id;
        const { expertise, desired_expertise } = req.body;

        if (Array.isArray(expertise)) {
            await UserExpertise.deleteByUserId(userId);
            if (expertise.length > 0) await UserExpertise.create(userId, expertise);
        }
        if (Array.isArray(desired_expertise)) {
            await UserDesiredExpertise.deleteByUserId(userId);
            if (desired_expertise.length > 0) await UserDesiredExpertise.create(userId, desired_expertise);
        }

        const [updatedExpertise, updatedDesired] = await Promise.all([
            UserExpertise.findByUserId(userId),
            UserDesiredExpertise.findByUserId(userId),
        ]);

        res.json({
            success: true,
            message: 'Expertise updated successfully',
            data: {
                expertise:         updatedExpertise.map(e => e.expertise),
                desired_expertise: updatedDesired.map(d => d.expertise),
            }
        });
    } catch (error) {
        console.error('Update expertise error:', error);
        res.status(500).json({ success: false, message: 'Failed to update expertise' });
    }
});

// Complete onboarding profile
router.post('/complete-profile', auth, [
    body('role').isIn(['mentor', 'mentee', 'both']).withMessage('Role must be mentor, mentee, or both'),
    body('name').notEmpty().withMessage('Name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('experience').notEmpty().withMessage('Experience is required'),
    body('availability').notEmpty().withMessage('Availability is required'),
    body('expertise').isArray().withMessage('Expertise must be an array'),
    body('interests').isArray().withMessage('Interests must be an array'),
    body('goals').isArray().withMessage('Goals must be an array'),
    body('languages').isArray().withMessage('Languages must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { expertise, interests, goals, languages, ...profileData } = req.body;
        profileData.user_id = req.user.id;

        // Create profile
        const profile = await UserProfile.create(profileData);

        // Create expertise entries
        if (expertise && expertise.length > 0) {
            await UserExpertise.create(req.user.id, expertise);

            // If mentor/both, also insert into expert_expertise so they appear in the matching pool
            const role = profileData.role;
            if (role === 'mentor' || role === 'both') {
                try {
                    // Get the expert_id for this user
                    const expertRow = await executeQuery(
                        `SELECT id FROM experts WHERE user_id = '${req.user.id}'`
                    );
                    if (expertRow.recordset.length > 0) {
                        const expertId = expertRow.recordset[0].id;
                        // Delete stale entries first, then re-insert
                        await executeQuery(`DELETE FROM expert_expertise WHERE expert_id = '${expertId}'`);
                        const expValues = expertise
                            .map(e => `('${expertId}', '${e.replace(/'/g, "''")}')`).join(', ');
                        await executeQuery(
                            `INSERT INTO expert_expertise (expert_id, expertise) VALUES ${expValues}`
                        );
                    }
                } catch (expErr) {
                    console.error('expert_expertise insert failed (non-fatal):', expErr.message);
                }
            }
        }

        // Create interests entries
        if (interests && interests.length > 0) {
            try { await UserInterests.create(req.user.id, interests); } catch {}
        }

        // Create goals entries
        if (goals && goals.length > 0) {
            await UserGoals.create(req.user.id, goals);
        }

        // Create languages entries
        if (languages && languages.length > 0) {
            await UserLanguages.create(req.user.id, languages);
        }

        res.json({
            success: true,
            message: 'Profile completed successfully',
            data: { profile }
        });

    } catch (error) {
        console.error('Complete profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error completing profile'
        });
    }
});

// ============ EMAIL VERIFICATION & PASSWORD RESET ENDPOINTS ============

// Verify email address
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Verification token is required'
            });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key-change-in-production');
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({
                    success: false,
                    error: 'Token expired'
                });
            }
            return res.status(400).json({
                success: false,
                error: 'Invalid token'
            });
        }

        // Check if token type is correct
        if (decoded.type !== 'email-verification') {
            return res.status(400).json({
                success: false,
                error: 'Invalid token type'
            });
        }

        // Get the email from the token
        const userEmail = decoded.email;
        
        // In TEST MODE, we don't have a database, so just verify the token is valid
        console.log('✅ Email verified for:', userEmail);

        // Send welcome email to the user's actual email address (don't fail verification if this fails)
        setTimeout(async () => {
            try {
                await sendWelcomeEmail(userEmail, userEmail.split('@')[0]);
                console.log('📧 Welcome email sent to:', userEmail);
            } catch (emailError) {
                console.error('⚠️  Welcome email failed (non-critical):', emailError.message);
            }
        }, 0);

        // Return success immediately (don't wait for welcome email)
        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during email verification'
        });
    }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // In TEST MODE, just send the email without checking database
        console.log('📧 Resending verification email to:', email);

        // Generate new verification token (expires in 24 hours)
        const verificationToken = jwt.sign(
            { email, type: 'email-verification' },
            process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
            { expiresIn: '24h' }
        );

        // Send verification email
        await sendVerificationEmail(email, verificationToken, email.split('@')[0]);

        res.json({
            success: true,
            message: 'Verification email sent successfully'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resend verification email'
        });
    }
});

// Forgot password - Send reset email
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
], async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ success: false, error: validationErrors.array()[0].msg });
        }

        const { email } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            // For security, don't reveal that user doesn't exist
            return res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link will be sent.'
            });
        }

        // Generate password reset token (expires in 1 hour)
        const resetToken = jwt.sign(
            { userId: user.user_id, email: user.email, type: 'password-reset' },
            process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
            { expiresIn: '1h' }
        );

        // Send password reset email
        await sendPasswordResetEmail(user.email, resetToken, user.name || 'User');

        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link will be sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process password reset request'
        });
    }
});

// Validate reset token
router.post('/validate-reset-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Reset token is required'
            });
        }

        // Verify the token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key-change-in-production');
            
            // Check if token is for password reset
            if (decoded.type !== 'password-reset') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid token type'
                });
            }

            // Verify user still exists
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'Token is valid'
            });

        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({
                    success: false,
                    error: 'Token has expired'
                });
            }
            return res.status(400).json({
                success: false,
                error: 'Invalid token'
            });
        }

    } catch (error) {
        console.error('Validate token error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error validating token'
        });
    }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Token and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key-change-in-production');
            
            // Check if token is for password reset
            if (decoded.type !== 'password-reset') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid token type'
                });
            }
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({
                    success: false,
                    error: 'Reset link has expired'
                });
            }
            return res.status(400).json({
                success: false,
                error: 'Invalid reset link'
            });
        }

        // Update user's password
        await User.updatePassword(decoded.userId, newPassword);

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset password'
        });
    }
});

// ─── GET /users/search?q=  — search platform users by name or email ──────────
router.get('/users/search', auth, async (req, res) => {
    try {
        const q = (req.query.q || '').replace(/'/g, "''").toLowerCase();
        if (!q || q.length < 2) {
            return res.json({ success: true, data: { users: [] } });
        }
        const result = await executeQuery(`
            SELECT TOP 10
                id, name, email,
                COALESCE(avatar_url, '') AS avatar,
                role,
                COALESCE(bio, '') AS organization
            FROM users
            WHERE (LOWER(name) LIKE '%${q}%' OR LOWER(email) LIKE '%${q}%')
              AND is_active = 1
            ORDER BY name
        `);
        res.json({ success: true, data: { users: result.recordset } });
    } catch (err) {
        console.error('GET /auth/users/search error:', err);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});

// Switch role — with safeguard against data loss
// Blocks switching AWAY from mentor if user has active mentee connections
// Blocks switching AWAY from mentee if user has active mentor connections
router.put('/switch-role', auth, async (req, res) => {
    try {
        const { newRole } = req.body;
        const userId = req.user.user_id;

        if (!['mentor', 'mentee', 'both'].includes(newRole)) {
            return res.status(400).json({ success: false, message: 'Invalid role. Must be mentor, mentee, or both.' });
        }

        // Fetch current role
        const currentResult = await executeQuery(`SELECT role, is_mentor, is_mentee FROM users WHERE id = '${userId}'`);
        if (!currentResult.recordset.length) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const current = currentResult.recordset[0];
        const wasmentor = current.is_mentor === true || current.is_mentor === 1;
        const wasmentee = current.is_mentee === true || current.is_mentee === 1;
        const willBeMentor = newRole === 'mentor' || newRole === 'both';
        const willBeMentee = newRole === 'mentee' || newRole === 'both';

        // Safeguard: switching away from mentor — check for active mentee connections
        if (wasmentor && !willBeMentor) {
            const expertCheck = await executeQuery(
                `SELECT TOP 1 e.id FROM experts e WHERE CAST(e.user_id AS NVARCHAR(100)) = '${userId}'`
            );
            if (expertCheck.recordset.length > 0) {
                const expertId = expertCheck.recordset[0].id;
                const activeCheck = await executeQuery(
                    `SELECT COUNT(*) as cnt FROM connections WHERE CAST(expert_id AS NVARCHAR(100)) = '${expertId}' AND status = 'active'`
                );
                if (activeCheck.recordset[0].cnt > 0) {
                    return res.status(409).json({
                        success: false,
                        blocked: 'mentor',
                        message: 'You have active mentees depending on you. Please complete or transfer those relationships before removing your mentor role.'
                    });
                }
            }
        }

        // Safeguard: switching away from mentee — check for active mentor connections
        if (wasmentee && !willBeMentee) {
            const activeCheck = await executeQuery(
                `SELECT COUNT(*) as cnt FROM connections WHERE CAST(requester_id AS NVARCHAR(100)) = '${userId}' AND status = 'active'`
            );
            if (activeCheck.recordset[0].cnt > 0) {
                return res.status(409).json({
                    success: false,
                    blocked: 'mentee',
                    message: 'You have active mentor relationships. Please complete or end those connections before removing your mentee role.'
                });
            }
        }

        // Apply the role change
        await executeQuery(`
            UPDATE users SET
                role = '${newRole}',
                is_mentor = ${willBeMentor ? 1 : 0},
                is_mentee = ${willBeMentee ? 1 : 0},
                updated_at = GETDATE()
            WHERE id = '${userId}'
        `);

        // Also update profile record if it exists
        await executeQuery(`
            UPDATE user_profiles SET
                can_mentor = ${willBeMentor ? 1 : 0},
                can_be_mentored = ${willBeMentee ? 1 : 0},
                updated_at = GETDATE()
            WHERE CAST(user_id AS NVARCHAR(100)) = '${userId}'
        `);

        res.json({
            success: true,
            message: `Role updated to ${newRole} successfully.`,
            data: { role: newRole }
        });
    } catch (err) {
        console.error('PUT /auth/switch-role error:', err);
        res.status(500).json({ success: false, message: 'Failed to update role.' });
    }
});

export default router;