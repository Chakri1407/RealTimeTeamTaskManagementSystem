# Real-Time Team Task Management System

A production-ready task management system built with Node.js, TypeScript, MongoDB, and Socket.IO.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Team Management**: Create teams, invite members, and manage team roles
- **Project Management**: Organize work into projects within teams
- **Task Management**: Full CRUD operations with task lifecycle management
- **Real-Time Updates**: Live notifications using Socket.IO
- **Activity Logging**: Track all actions and changes
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Testing**: Comprehensive unit and integration tests
- **Production Ready**: Deployed on Vercel with proper configurations

## Tech Stack

- **Backend**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator & class-transformer
- **Testing**: Jest & Supertest
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Vercel

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the development server:
```bash
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Teams
- `GET /api/teams` - Get all user teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add team member
- `DELETE /api/teams/:id/members/:userId` - Remove member

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/assign` - Assign task to user

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Deployment

The application is configured for deployment on Vercel.

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

## Project Structure

```
task-management-system/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middlewares/    # Express middlewares
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── socket/         # Socket.IO handlers
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── validators/     # Request validation DTOs
│   ├── docs/           # API documentation
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── dist/               # Compiled JavaScript
├── coverage/           # Test coverage reports
└── tests/              # Test files
```

## Real-Time Features

The application uses Socket.IO for real-time communication:

- **Task Updates**: Instant notifications when tasks are created/updated
- **Team Activity**: Live updates for team member actions
- **Status Changes**: Real-time task status transitions
- **Assignment Notifications**: Immediate alerts for task assignments

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Role-based access control

## API Documentation

Access the interactive API documentation at:
```
http://localhost:5000/api-docs
```

## License

MIT

## Author

SoluLab

## Contributing

Pull requests are welcome. For major changes, please open an issue first. 