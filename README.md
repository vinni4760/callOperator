# Call Center Management System

A full-stack call center management application with separate admin and user dashboards.

## 🚀 Deployment

### Production URLs
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Render
- **Database**: MongoDB Atlas

See the [Deployment Guide](.agent/workflows/deploy.md) for detailed instructions.

### Quick Deploy
```bash
# See deployment workflow
cat .agent/workflows/deploy.md
```

## Features

### Admin Dashboard
- 📞 Create and manage call entries
- 👥 Add and manage users
- 📊 View all calls with status tracking
- ✅ Monitor feedback and call recordings from users
- 📈 Dashboard with real-time statistics

### User Dashboard
- 📋 View assigned calls
- 💬 Submit feedback for calls
- 🎙️ Upload call recordings (stored in Cloudinary)
- ⭐ Rate call quality (1-5 stars)

## Tech Stack

### Backend
- Node.js + Express
- MongoDB (with Mongoose)
- JWT Authentication
- Cloudinary (for call recording storage)
- Bcrypt (password hashing)

### Frontend
- React 18
- Vite
- React Router
- Axios
- React Icons
- Modern UI with glassmorphism design

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Login

After setting up, you can register your first admin account:

1. Go to `http://localhost:5173`
2. Click "Create Account"
3. Fill in the details (first user should set role to 'admin' via API or database)

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Admin Routes (Protected)
- POST `/api/admin/calls` - Create call
- GET `/api/admin/calls` - Get all calls
- PUT `/api/admin/calls/:id` - Update call
- DELETE `/api/admin/calls/:id` - Delete call
- POST `/api/admin/users` - Create user
- GET `/api/admin/users` - Get all users
- GET `/api/admin/dashboard/stats` - Get statistics

### User Routes (Protected)
- GET `/api/user/calls` - Get assigned calls
- GET `/api/user/calls/:id` - Get call details
- POST `/api/user/feedback` - Submit feedback (with recording)
- GET `/api/user/dashboard/stats` - Get user statistics

## Project Structure

```
callcst/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── cloudinary.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Call.js
│   │   │   └── CallFeedback.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   └── user.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── CallManagement.jsx
    │   │   │   ├── CallForm.jsx
    │   │   │   └── UserManagement.jsx
    │   │   ├── user/
    │   │   │   ├── UserDashboard.jsx
    │   │   │   ├── CallList.jsx
    │   │   │   └── FeedbackForm.jsx
    │   │   ├── Login.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── api/
    │   │   └── axios.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## Features in Detail

### Call Management
- Add call details (customer info, category, priority, duration)
- Assign calls to users
- Track call status (pending, completed, in-review)
- View feedback and recordings

### User Feedback
- Star rating system (1-5)
- Text feedback
- Audio recording upload (mp3, wav, ogg, m4a, webm)
- Automatic status update on submission

### Dashboard Analytics
- Total calls count
- Pending vs completed calls
- Active users
- Feedback submission tracking

## License

ISC
