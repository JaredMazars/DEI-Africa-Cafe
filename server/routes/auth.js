import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import UserExpertise from '../models/UserExpertise.js';
import UserInterests from '../models/UserInterests.js';
import UserGoals from '../models/UserGoals.js';
import UserLanguages from '../models/UserLanguages.js';
import auth from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/emailService.js';

const router = express.Router();

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

        // TEMPORARY: Just send verification email for testing (no database storage)
        try {
            // Generate verification token (expires in 24 hours)
            const verificationToken = jwt.sign(
                { email, type: 'email-verification' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Send verification email to the user's actual email address
            await sendVerificationEmail(email, verificationToken, email.split('@')[0]);
            
            console.log(`📧 Verification email sent to ${email}`);

            // Return success response
            res.status(201).json({
                success: true,
                message: `Registration successful! Verification email sent to ${email}`,
                data: {
                    user: {
                        id: 'temp-' + Date.now(),
                        email: email,
                        isFirstLogin: false,
                        emailVerified: false
                    },
                    token: jwt.sign(
                        { userId: 'temp-' + Date.now(), email },
                        process.env.JWT_SECRET,
                        { expiresIn: '7d' }
                    )
                }
            });
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Still return success even if email fails (for testing)
            res.status(201).json({
                success: true,
                message: 'Registration successful! (Email service unavailable)',
                data: {
                    user: {
                        id: 'temp-' + Date.now(),
                        email: email,
                        isFirstLogin: false,
                        emailVerified: false
                    },
                    token: jwt.sign(
                        { userId: 'temp-' + Date.now(), email },
                        process.env.JWT_SECRET,
                        { expiresIn: '7d' }
                    )
                }
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
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

        // TEST MODE: Allow login without database
        console.log('🔐 Login attempt:', email);

        // For demo purposes, accept the hardcoded admin credentials
        if (email === 'jaredmoodley1212@gmail.com' && password === 'password123') {
            const token = jwt.sign(
                { userId: 'demo-admin-123', email },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: 'demo-admin-123',
                        email: email,
                        isFirstLogin: false,
                        profile: {
                            name: 'Admin User',
                            role: 'mentee',
                            location: 'South Africa'
                        }
                    },
                    token
                }
            });
        }

        // For any other credentials in TEST MODE, just accept them if they're formatted correctly
        // In production, this would check against database
        console.log('✅ TEST MODE: Accepting login for:', email);
        
        const token = jwt.sign(
            { userId: 'user-' + Date.now(), email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: 'user-' + Date.now(),
                    email: email,
                    isFirstLogin: false,
                    profile: {
                        name: email.split('@')[0],
                        role: 'mentee',
                        location: 'Unknown'
                    }
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
        const profile = await UserProfile.findByUserId(req.user.user_id);
        
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user.user_id,
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
    body('role').isIn(['mentor', 'mentee']).withMessage('Role must be mentor or mentee'),
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
        profileData.user_id = req.user.user_id;

        // Create profile
        const profile = await UserProfile.create(profileData);

        // Create expertise entries
        if (expertise && expertise.length > 0) {
            await UserExpertise.create(req.user.user_id, expertise);
        }

        // Create interests entries
        if (interests && interests.length > 0) {
            await UserInterests.create(req.user.user_id, interests);
        }

        // Create goals entries
        if (goals && goals.length > 0) {
            await UserGoals.create(req.user.user_id, goals);
        }

        // Create languages entries
        if (languages && languages.length > 0) {
            await UserLanguages.create(req.user.user_id, languages);
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
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
            process.env.JWT_SECRET || 'your-secret-key',
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
            process.env.JWT_SECRET || 'your-secret-key',
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            
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
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            
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