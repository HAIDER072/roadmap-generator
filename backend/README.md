# Roadmap Generator Backend

A Node.js/Express backend API with JWT authentication for the Roadmap Generator application.

## Features

- 🔐 **JWT Authentication** - Secure user registration, login, and token management
- 👤 **User Management** - Profile updates, preferences, password changes
- 🗺️ **Roadmap CRUD** - Create, read, update, delete roadmaps with progress tracking
- 📊 **Progress Tracking** - Step completion, statistics, and user analytics
- 🔒 **Security** - Rate limiting, CORS, input validation, and secure password hashing
- 🗄️ **MongoDB Integration** - Robust data persistence with Mongoose ODM

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/roadmap-generator

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Using mongod directly
mongod

# Or using MongoDB service (macOS)
brew services start mongodb-community

# Or using MongoDB service (Ubuntu)
sudo systemctl start mongod
```

### 4. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/preferences` - Update user preferences
- `POST /api/user/change-password` - Change password
- `DELETE /api/user/account` - Delete account
- `GET /api/user/stats` - Get user statistics

### Roadmaps
- `GET /api/roadmaps` - Get user's roadmaps
- `GET /api/roadmaps/public` - Get public roadmaps
- `GET /api/roadmaps/:id` - Get single roadmap
- `POST /api/roadmaps` - Create new roadmap
- `PUT /api/roadmaps/:id` - Update roadmap
- `DELETE /api/roadmaps/:id` - Delete roadmap
- `POST /api/roadmaps/:id/steps/:stepId/complete` - Mark step complete
- `POST /api/roadmaps/:id/like` - Like/unlike roadmap

### Health Check
- `GET /api/health` - Server health check

## Authentication Flow

1. **Register/Login** - User creates account or signs in
2. **JWT Tokens** - Server returns access and refresh tokens
3. **Authenticated Requests** - Include `Authorization: Bearer <token>` header
4. **Token Refresh** - Use refresh token to get new access token when expired

## Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String,
  isEmailVerified: Boolean,
  role: String,
  preferences: {
    theme: String,
    notifications: Object
  },
  refreshTokens: Array,
  // timestamps
}
```

### Roadmap Model
```javascript
{
  title: String,
  description: String,
  topic: String,
  difficulty: String,
  steps: Array,
  tags: Array,
  isPublic: Boolean,
  createdBy: ObjectId,
  progress: {
    completedSteps: Number,
    totalSteps: Number,
    percentage: Number
  },
  metadata: Object,
  // timestamps
}
```

## Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Security** - Secure token generation and validation
- **Rate Limiting** - Prevent abuse and DDoS attacks
- **CORS Protection** - Configure allowed origins
- **Input Validation** - Validate all user inputs
- **Error Handling** - Secure error messages

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a strong `JWT_SECRET`
3. Configure MongoDB connection string
4. Set up reverse proxy (nginx)
5. Enable HTTPS
6. Configure proper CORS origins

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

MIT License - see LICENSE file for details
