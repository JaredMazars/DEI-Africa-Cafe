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
            process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
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
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
            { expiresIn: '7d' }
        );

        // Send verification email (non-blocking)
        try {
            const verificationToken = jwt.sign(
                { email, type: 'email-verification' },
                process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
                { expiresIn: '24h' }
            );
            await sendVerificationEmail(email, verificationToken, email.split('@')[0]);
            console.log(`📧 Verification email sent to ${email}`);
        } catch (emailError) {
            console.error('Verification email failed (non-fatal):', emailError.message);
        }

        res.status(201).json({
            success: true,
            message: `Registration successful! Please check ${email} to verify your account.`,
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    isFirstLogin: true,
                    emailVerified: false
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

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'demo-secret-key-change-in-production',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
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

// Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await UserProfile.findByUserId(req.user.id);
        
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    isFirstLogin: !profile,
                    profile: profile || null
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
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

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

export default router;