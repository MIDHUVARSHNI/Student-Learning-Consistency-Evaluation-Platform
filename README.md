# Student Learning Consistency Evaluation Platform

A comprehensive web application designed to evaluate and track student learning consistency across multiple dimensions including attendance, performance, participation, and assignment submission patterns.

## 🎯 Project Overview

The Student Learning Consistency Evaluation Platform is a MERN (MongoDB, Express.js, React.js, Node.js) stack application that empowers instructors and administrators to:

- **Track Learning Consistency**: Monitor student behavior across multiple metrics
- **Generate Insights**: Automatic calculation of consistency scores using weighted algorithms
- **Identify At-Risk Students**: Flag students requiring intervention based on consistency patterns
- **Generate Reports**: Create comprehensive consistency reports in PDF and Excel formats
- **Analytics Dashboard**: Visualize trends and patterns across the entire class

### Key Features

✅ **Student Evaluation Management** - Create, update, and manage evaluations  
✅ **Consistency Metrics Calculation** - Automated weighted score calculation  
✅ **Role-Based Access Control** - Admin, Instructor, and Student roles  
✅ **Comprehensive Reporting** - PDF and Excel export capabilities  
✅ **Analytics Dashboard** - Charts and visualizations for trends  
✅ **Audit Logging** - Track all user actions for accountability  
✅ **Responsive Design** - Mobile, tablet, and desktop optimized  
✅ **JWT Authentication** - Secure token-based authentication  

---

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Project Architecture](#project-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Development Workflow](#development-workflow)
- [Contributing Guidelines](#contributing-guidelines)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## 📁 Project Structure

```
student-learning-platform/
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── common/              # Common components (Button, Modal, etc.)
│   │   │   ├── layout/              # Layout components (Header, Sidebar, etc.)
│   │   │   └── features/            # Feature-specific components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/                   # Page components (Dashboard, Learners, etc.)
│   │   ├── services/                # API service layer (axios clients)
│   │   ├── store/                   # Redux store (actions, reducers, selectors)
│   │   ├── styles/                  # Global styles and Tailwind config
│   │   ├── utils/                   # Utility functions and helpers
│   │   ├── App.tsx                  # Root App component
│   │   └── main.tsx                 # React entry point
│   ├── .env.example                 # Environment variables template
│   ├── .eslintrc.cjs                # ESLint configuration
│   ├── .gitignore                   # Git ignore rules
│   ├── package.json                 # Dependencies and scripts
│   ├── postcss.config.js            # PostCSS configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tsconfig.node.json           # TypeScript Node config
│   ├── vite.config.ts               # Vite build configuration
│   └── index.html                   # HTML entry point
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/                  # Configuration files (database, env, etc.)
│   │   ├── controllers/             # Route handlers/controllers
│   │   │   ├── authController.ts
│   │   │   ├── learnerController.ts
│   │   │   ├── evaluationController.ts
│   │   │   └── ...
│   │   ├── middleware/              # Express middleware
│   │   │   ├── authMiddleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── ...
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Learner.ts
│   │   │   ├── Evaluation.ts
│   │   │   └── ...
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.ts
│   │   │   ├── learners.ts
│   │   │   ├── evaluations.ts
│   │   │   └── ...
│   │   ├── services/                # Business logic layer
│   │   │   ├── authService.ts
│   │   │   ├── learnerService.ts
│   │   │   ├── consistencyMetricsService.ts
│   │   │   └── ...
│   │   ├── utils/                   # Utility functions
│   │   │   ├── logger.ts
│   │   │   ├── validators.ts
│   │   │   └── ...
│   │   ├── types/                   # TypeScript interfaces and types
│   │   └── server.ts                # Express app entry point
│   │
│   ├── .env.example                 # Environment variables template
│   ├── .eslintrc.json               # ESLint configuration
│   ├── .gitignore                   # Git ignore rules
│   ├── package.json                 # Dependencies and scripts
│   ├── tsconfig.json                # TypeScript configuration
│   └── nodemon.json                 # Nodemon configuration (optional)
│
├── Phase-1-Documentation/           # Phase 1 Documentation
│   ├── 01-TECH-STACK-ARCHITECTURE.md
│   ├── 02-DATABASE-SCHEMA-ERD.md
│   ├── 03-UI-UX-WIREFRAMES-THEME.md
│   └── 04-SETUP-INSTRUCTIONS.md
│
├── docs/                            # Additional documentation
│   ├── API-DOCUMENTATION.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
│
├── .gitignore                       # Global Git ignore rules
├── README.md                        # This file
└── package.json                     # Root package.json (optional, for monorepo)
```

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js & React-ChartJS-2** - Data visualization
- **Axios** - HTTP client
- **HeadlessUI** - Unstyled UI components

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Data validation
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### DevOps & Tools
- **Git** - Version control
- **GitHub** - Repository hosting
- **ESLint** - Code quality
- **Nodemon** - Auto-reload in development
- **Vercel** - Frontend deployment (recommended)
- **MongoDB Atlas** - Managed database
- **Heroku/Railway** - Backend deployment (recommended)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.x or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

### Verify Installation

```bash
node --version    # Should show v16.x or higher
npm --version     # Should show 8.x or higher
git --version     # Should show 2.x or higher
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/student-learning-platform.git
cd student-learning-platform
```

### 2. Install Client Dependencies

```bash
cd client
npm install
```

### 3. Install Server Dependencies

```bash
cd ../server
npm install
```

### 4. Return to Root Directory

```bash
cd ..
```

---

## ⚙️ Environment Configuration

### Frontend Environment Variables

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Create a `.env.local` file by copying the example:
   ```bash
   cp .env.example .env.local
   ```

3. Update the variables as needed:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=Student Learning Consistency Evaluation Platform
   ```

### Backend Environment Variables

1. Navigate to the server directory:
   ```bash
   cd ../server
   ```

2. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

3. Update the variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student-learning-platform
   JWT_SECRET=your-secret-key-here
   CORS_ORIGIN=http://localhost:5173
   ```

### MongoDB Connection

#### Option 1: Local MongoDB
```bash
# Make sure MongoDB is running
mongod

# Connection string in .env
MONGODB_URI=mongodb://localhost:27017/student-learning-platform
```

#### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get connection string: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>`
5. Update `MONGODB_URI` in `.env`

---

## 🎮 Running the Application

### Development Mode

#### Terminal 1: Start Backend Server

```bash
cd server
npm run dev
```

Expected output:
```
[nodemon] starting `node --loader tsx src/server.ts`
Server running on http://localhost:5000
MongoDB connected successfully
```

#### Terminal 2: Start Frontend Dev Server

```bash
cd client
npm run dev
```

Expected output:
```
VITE v4.3.0 ready in 345 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:5000/api
- **Default Credentials**: (Set up during initial configuration)

---

## 🏗 Project Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT (React + Redux)                    │
│         Handles UI, State Management, User Interaction      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│              SERVER (Express.js + Node.js)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Routes → Controllers → Services → Models           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ MongoDB Protocol
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB Collections)                 │
│  users, learners, evaluations, metrics, reports, audit_logs│
└─────────────────────────────────────────────────────────────┘
```

### Key Component Interactions

1. **Authentication Flow**: User → Login Component → Redux Action → API Call → JWT Token → localStorage
2. **Data Retrieval**: Component → Redux Selector → Middleware → API Service → Server → Database
3. **Data Submission**: Form → Validation → Redux Action → API Call → Server Middleware → Database

---

## 💾 Database Schema

### Collections Overview

1. **users** - Instructors and Administrators
2. **learners** - Student information
3. **evaluations** - Individual evaluation records
4. **learning_metrics** - Calculated consistency metrics
5. **consistency_reports** - Generated reports
6. **audit_logs** - Activity tracking
7. **notifications** - User notifications

Detailed schema information: See [Database Schema Documentation](./Phase-1-Documentation/02-DATABASE-SCHEMA-ERD.md)

---

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

### Learner Management

```
GET    /api/learners                 # Get all learners
GET    /api/learners/:id             # Get specific learner
POST   /api/learners                 # Create learner
PUT    /api/learners/:id             # Update learner
DELETE /api/learners/:id             # Delete learner
```

### Evaluations

```
GET    /api/evaluations              # Get all evaluations
GET    /api/evaluations/:id          # Get specific evaluation
POST   /api/evaluations              # Create evaluation
PUT    /api/evaluations/:id          # Update evaluation
DELETE /api/evaluations/:id          # Delete evaluation
```

### Reports

```
GET    /api/reports                  # Get all reports
GET    /api/reports/:learnerId       # Get learner report
POST   /api/reports                  # Generate report
GET    /api/reports/:id/download     # Download PDF
```

Complete API documentation: [API-DOCUMENTATION.md](./docs/API-DOCUMENTATION.md)

---

## 👨‍💻 Development Workflow

### Branching Strategy (Git Flow)

```
main
  ↑
  ├── release/v0.1.0 (Release branch)
  │     ↑
  │     └── develop (Integration branch)
  │           ↑
  │           ├── feature/user-authentication
  │           ├── feature/evaluation-management
  │           ├── bugfix/login-error
  │           └── ...
```

### Branch Naming Conventions

- **Feature**: `feature/description` (e.g., `feature/user-authentication`)
- **Bugfix**: `bugfix/issue-name` (e.g., `bugfix/login-error`)
- **Release**: `release/v0.1.0`
- **Hotfix**: `hotfix/critical-issue`

### Git Workflow Example

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature description"

# 3. Push to remote
git push origin feature/new-feature

# 4. Create Pull Request on GitHub

# 5. After PR approval and merge
git checkout develop
git pull origin develop
```

### Commit Message Conventions (Conventional Commits)

```
feat: add new feature           # New feature
fix: resolve bug               # Bug fix
docs: update documentation     # Documentation
style: format code             # Code style changes
refactor: restructure code     # Code refactoring
test: add tests                # Test additions
chore: update dependencies     # Maintenance tasks
```

---

## 🤝 Contributing Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`feature/your-feature`)
3. **Commit** changes with conventional commits
4. **Push** to your fork
5. **Create** a Pull Request with clear description
6. **Request** code review
7. **Address** feedback and merge

### Code Standards

- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Keep functions focused and small

---

## 🚢 Deployment

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel
```

### Backend Deployment (Heroku)

```bash
# Install Heroku CLI
npm i -g heroku

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

Detailed deployment guide: [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

#### MongoDB Connection Error
```bash
# Check MongoDB is running
mongod --version

# Verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/database-name
```

#### CORS Error
```
Ensure CORS_ORIGIN in server/.env matches frontend URL:
CORS_ORIGIN=http://localhost:5173
```

Full troubleshooting guide: [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

## 📞 Support

### Getting Help

- **Documentation**: Check [Phase 1 Documentation](./Phase-1-Documentation/)
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: contact@platform.com

### Resources

- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

- **Project Lead**: [Your Name]
- **Frontend Lead**: [Developer Name]
- **Backend Lead**: [Developer Name]
- **Database Admin**: [Developer Name]

---

## 🎉 Acknowledgments

Special thanks to all contributors and the open-source community for amazing tools and libraries.

---

## Version History

- **v0.1.0** (Current)
  - Phase 1: Architecture, Database Schema, UI/UX Design
  - Project Setup and Configuration
  - Documentation and Branching Strategy

---

## Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies (client & server)
- [ ] Configure environment variables
- [ ] Start MongoDB
- [ ] Run backend server (`npm run dev` in server)
- [ ] Run frontend dev server (`npm run dev` in client)
- [ ] Open http://localhost:5173 in browser
- [ ] Login with credentials
- [ ] Explore dashboard

---

**Happy coding! 🚀**

For more information, refer to the [Phase 1 Documentation](./Phase-1-Documentation/) folder.
