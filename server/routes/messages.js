import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Connection from '../models/Connection.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
// io is initialised in server.js — lazy import avoids circular-dependency issues
let _io = null;
const getIO = async () => {
    if (!_io) { const m = await import('../server.js'); _io = m.io; }
    return _io;
};

const router = express.Router();

// Get messages for a connection
router.get('/connection/:connectionId', auth, async (req, res) => {
    try {
        const { connectionId } = req.params;

        // Verify that the user is part of this connection
        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Connection not found'
            });
        }

        if (req.user.user_id !== connection.mentor_id && req.user.user_id !== connection.mentee_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only view messages from your own connections'
            });
        }

        const messages = await Message.getConnectionMessages(connectionId);

        res.json({
            success: true,
            data: { messages }
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
});

// Send a message
router.post('/', auth, [
    body('connection_id').isUUID().withMessage('Valid connection ID is required'),
    body('message_text').notEmpty().withMessage('Message text is required')
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

        const { connection_id, message_text } = req.body;

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
                message: 'You can only send messages to your own connections'
            });
        }

        const messageData = {
            connection_id,
            sender_id: req.user.user_id,
            message_text
        };

        const message = await Message.create(messageData);

        // Emit real-time event to all participants in this connection room
        try {
            const socketIO = await getIO();
            socketIO.to(`connection:${connection_id}`).emit('new_message', message);
        } catch { /* non-fatal if socket not ready */ }

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { message }
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});

// Mark message as read
router.put('/:messageId/read', auth, async (req, res) => {
    try {
        const { messageId } = req.params;

        await Message.markAsRead(messageId);

        res.json({
            success: true,
            message: 'Message marked as read'
        });

    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as read'
        });
    }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const unreadCount = await Message.getUnreadCount(req.user.user_id);

        res.json({
            success: true,
            data: { unreadCount }
        });

    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
});

// Get recent messages for dashboard
router.get('/recent', auth, async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const recentMessages = await Message.getRecentMessages(req.user.user_id, parseInt(limit));

        res.json({
            success: true,
            data: { messages: recentMessages }
        });

    } catch (error) {
        console.error('Error getting recent messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recent messages'
        });
    }
});

export default router;