import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConnection } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import connectionRoutes from './routes/connections.js';
import sessionRoutes from './routes/sessions.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import expertRoutes from './routes/experts.js';
import questionRoutes from './routes/questions.js';
import opportunityRoutes from './routes/opportunities.js';
import dashboardRoutes from './routes/dashboard.js';
import preferencesRoutes from './routes/preferences.js';
import matchingRoutes from './routes/matching.js';
import resourceRoutes from './routes/resources.js';
import reflectionRoutes from './routes/reflections.js';

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from React build
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'DEI Cafe API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reflections', reflectionRoutes);

// Serve React app for all non-API routes (SPA routing)
app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    }
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Database connection test and server start
const startServer = async () => {
    try {
        // Test database connection (optional - don't block startup if DB fails)
        try {
            console.log('🔌 Testing database connection...');
            const pool = await getConnection();
            console.log('✅ Database connected successfully!');
            
            // Simple connection test - just count tables
            const result = await pool.request().query(`
                SELECT COUNT(*) as table_count 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE = 'BASE TABLE'
            `);
            console.log(`📊 Database has ${result.recordset[0].table_count} tables`);
        } catch (dbError) {
            console.warn('⚠️  Database connection failed (continuing in limited mode):', dbError.message);
            console.log('💡 App will use demo mode for authentication endpoints');
        }
        
        // Start server regardless of database connection
        app.listen(PORT, () => {
            console.log(`\n🚀 DEI Cafe API server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            console.log(`✉️  Email service ready for testing`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;