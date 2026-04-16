# DEI Cafe Backend API

A comprehensive Node.js backend for the DEI Cafe mentorship platform using Express.js and Azure SQL Database.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access
- **User Management**: Complete user profiles with expertise, interests, and goals
- **Mentorship Connections**: Mentor-mentee relationship management
- **Session Management**: Schedule and track mentoring sessions
- **Messaging System**: Real-time communication between users
- **Expert Directory**: Verified experts with Q&A functionality
- **Collaboration Hub**: Business opportunities and partnerships
- **Admin Dashboard**: Platform analytics and user management

## Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: Microsoft Azure SQL Database
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## Project Structure

```
server/
├── config/
│   └── database.js          # Azure SQL Database configuration
├── models/
│   ├── User.js              # User authentication model
│   ├── UserProfile.js       # User profile management
│   ├── UserExpertise.js     # User skills and expertise
│   ├── Connection.js        # Mentor-mentee connections
│   ├── Session.js           # Mentoring sessions
│   ├── Message.js           # Messaging system
│   ├── Review.js            # Rating and feedback
│   ├── Expert.js            # Expert directory
│   ├── Question.js          # Expert Q&A forum
│   └── Opportunity.js       # Collaboration opportunities
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── connections.js       # Connection management
│   ├── sessions.js          # Session management
│   ├── messages.js          # Messaging endpoints
│   ├── experts.js           # Expert directory
│   ├── questions.js         # Q&A forum
│   ├── opportunities.js     # Collaboration hub
│   ├── dashboard.js         # Dashboard data
│   └── admin.js             # Admin functionality
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── server.js                # Main application entry point
├── package.json             # Dependencies and scripts
└── .env.example             # Environment variables template
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/complete-profile` - Complete onboarding

### Connections
- `GET /api/connections` - Get user connections
- `POST /api/connections` - Create connection request
- `PUT /api/connections/:id/status` - Update connection status
- `GET /api/connections/stats` - Get connection statistics

### Sessions
- `GET /api/sessions` - Get user sessions
- `GET /api/sessions/upcoming` - Get upcoming sessions
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id/status` - Update session status

### Messages
- `GET /api/messages/connection/:id` - Get connection messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read
- `GET /api/messages/unread-count` - Get unread count

### Expert Directory
- `GET /api/experts` - Get all experts
- `GET /api/experts/:id` - Get expert by ID
- `POST /api/experts` - Create expert profile
- `PUT /api/experts/:id/availability` - Update availability

### Questions (Expert Forum)
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Post new question
- `GET /api/questions/:id` - Get question by ID
- `PUT /api/questions/:id/answered` - Mark as answered

### Opportunities
- `GET /api/opportunities` - Get all opportunities
- `POST /api/opportunities` - Create opportunity
- `GET /api/opportunities/:id` - Get opportunity by ID
- `PUT /api/opportunities/:id/status` - Update status

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/activity` - Get activity feed

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/mentors` - All mentors
- `GET /api/admin/mentees` - All mentees

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure SQL Database credentials
   ```

3. **Setup Database**
   - Run the `azure-sql-database-schema.sql` script in your Azure SQL Database
   - Update connection details in `.env`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Production Deployment**
   ```bash
   npm start
   ```

## Environment Variables

```env
# Database Configuration
DB_SERVER=your-azure-sql-server.database.windows.net
DB_DATABASE=OneAfricaHub
DB_USER=your-username
DB_PASSWORD=your-password
DB_PORT=1433

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Database Schema

The application uses a comprehensive database schema with the following main tables:

- **Users**: Authentication and basic user data
- **UserProfiles**: Detailed user information and preferences
- **UserExpertise/Interests/Goals/Languages**: User attributes
- **Connections**: Mentor-mentee relationships
- **Sessions**: Scheduled mentoring sessions
- **Messages**: Communication between users
- **Reviews**: Ratings and feedback
- **Experts**: Expert directory profiles
- **Questions/QuestionAnswers**: Expert Q&A forum
- **Opportunities**: Collaboration and business opportunities

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configured for frontend domain
- **Input Validation**: Express Validator for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **Helmet Security**: Security headers

## Development

- **Hot Reload**: Nodemon for development
- **ES6 Modules**: Modern JavaScript syntax
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed console logging for debugging
- **Validation**: Input validation on all endpoints

## Testing

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details