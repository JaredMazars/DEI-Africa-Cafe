import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Connection from '../models/Connection.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get user's sessions
router.get('/', auth, async (req, res) => {
    try {
        const sessions = await Session.getUserSessions(req.user.user_id);
        
        res.json({
            success: true,
            data: { sessions }
        });

    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sessions'
        });
    }
});

// Get sessions for a specific connection
router.get('/connection/:connectionId', auth, async (req, res) => {
    try {
        const { connectionId } = req.params;
        const result = await Session.getConnectionSessions(connectionId);
        res.json({ success: true, data: { sessions: result } });
    } catch (error) {
        console.error('Error fetching connection sessions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
    }
});

// Get upcoming sessions
router.get('/upcoming', auth, async (req, res) => {
    try {
        const sessions = await Session.getUpcomingSessions(req.user.user_id);
        
        res.json({
            success: true,
            data: { sessions }
        });

    } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming sessions'
        });
    }
});

// Create new session
router.post('/', auth, [
    body('connection_id').isUUID().withMessage('Valid connection ID is required'),
    body('title').notEmpty().withMessage('Session title is required'),
    body('scheduled_at').isISO8601().withMessage('Valid scheduled date is required'),
    body('duration_minutes').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes')
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

        const { connection_id } = req.body;

        // Verify that the connection exists and user is part of it
        const connection = await Connection.findById(connection_id);
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Connection not found'
            });
        }

        if (req.user.user_id !== connection.mentor_id && req.user.user_id !== connection.mentee_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only create sessions for your own connections'
            });
        }

        const session = await Session.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Session created successfully',
            data: { session }
        });

    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create session'
        });
    }
});

// Update session status
router.put('/:sessionId/status', auth, [
    body('status').isIn(['scheduled', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status'),
    body('notes').optional().isString()
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

        const { sessionId } = req.params;
        const { status, notes } = req.body;

        // Find the session and verify user access
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Get the connection to verify user access
        const connection = await Connection.findById(session.connection_id);
        if (req.user.user_id !== connection.mentor_id && req.user.user_id !== connection.mentee_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own sessions'
            });
        }

        const updatedSession = await Session.updateStatus(sessionId, status, notes);

        res.json({
            success: true,
            message: 'Session status updated successfully',
            data: { session: updatedSession }
        });

    } catch (error) {
        console.error('Error updating session status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update session status'
        });
    }
});

// Update session meeting link
router.patch('/:sessionId/link', auth, [
    body('meeting_link').isURL().withMessage('Valid URL required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'Invalid URL', errors: errors.array() });
        }
        const { sessionId } = req.params;
        const { meeting_link } = req.body;
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        const connection = await Connection.findById(session.connection_id);
        if (req.user.user_id !== connection.mentor_id && req.user.user_id !== connection.mentee_id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        await Session.updateMeetingLink(sessionId, meeting_link);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating meeting link:', error);
        res.status(500).json({ success: false, message: 'Failed to update meeting link' });
    }
});

// Get session statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await Session.getSessionStats();
        
        res.json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        console.error('Error fetching session stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch session statistics'
        });
    }
});

export default router;