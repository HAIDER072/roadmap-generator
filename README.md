# Roadmap Generator

A full-stack web application for creating, managing, and tracking learning roadmaps with AI assistance.

## Features

- 🤖 AI-powered roadmap generation
- 📊 Progress tracking with visual indicators
- 🗂️ Personal dashboard for roadmap management
- 🗑️ Delete and manage your roadmaps
- 👤 User authentication and profiles
- 📱 Responsive design

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Express rate limiting & security

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/roadmap-generator
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
   JWT_EXPIRE=7d
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the root directory:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start the frontend development server:
   ```bash
   npm start
   ```

### Running Both Servers

To run both frontend and backend simultaneously, you can use two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string ⚠️ **Keep secret**
- `JWT_SECRET` - Secret for JWT token signing ⚠️ **Keep secret**
- `JWT_EXPIRE` - JWT token expiration time
- `FRONTEND_URL` - Frontend URL for CORS
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env` files to version control
- The `.gitignore` file is configured to exclude all environment files
- Use strong, unique JWT secrets in production
- Replace MongoDB connection strings with your own

## Dashboard Features

The dashboard now features a clean, simple interface that:
- Shows the total count of roadmaps you've created
- Displays each roadmap as a card/block
- Includes a delete button on each roadmap card
- Connects to the proper API endpoints
- Saves all roadmap data in MongoDB

## Database Format

Roadmaps are saved in MongoDB with the following structure:
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  topic: String,
  difficulty: String, // 'beginner', 'intermediate', 'advanced'
  steps: [{
    id: String,
    title: String,
    description: String,
    isCompleted: Boolean,
    resources: Array,
    estimatedTime: Object,
    order: Number
  }],
  progress: {
    completedSteps: Number,
    totalSteps: Number,
    percentage: Number
  },
  isPublic: Boolean,
  createdBy: ObjectId, // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

## License

This project is licensed under the MIT License.
