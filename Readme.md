# Real-Time Team Task Management System

An opinionated, production-ready task management API with real-time updates — built with Node.js, TypeScript, Express, MongoDB and Socket.IO.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start (Local)](#quick-start-local)
- [Testing](#testing)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Deployment (Vercel)](#deployment-vercel)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This repository implements a Real-Time Team Task Management System API. It supports team and project management, task lifecycle with controlled status transitions, activity logging, and real-time notifications via Socket.IO. The project is fully typed with TypeScript and includes tests and Swagger documentation.

## Features

- JWT-based authentication (access + refresh tokens)
- Role-based access control for teams (admin / member)
- Teams, Projects, Tasks CRUD with validations
- Task lifecycle (To Do → In Progress → Review → Done)
- Activity logging for audit trails
- Real-time events via Socket.IO (project/task events)
- Request validation via `class-validator`
- Swagger/OpenAPI documentation
- Jest tests with in-memory MongoDB for CI-friendly tests

## Tech Stack

- Node.js + TypeScript
- Express
- MongoDB + Mongoose
- Socket.IO for real-time updates
- class-validator / class-transformer for DTOs
- Jest + Supertest for testing
- Swagger (swagger-jsdoc + swagger-ui-express)

## Prerequisites

- Node.js >= 18
- npm >= 9
- A running MongoDB instance (local or Atlas)

---

## Quick Start (Local)

1. Clone and install:

```powershell
git clone <repository-url>
cd Realtimeteamtaskmanagement
npm install
```

2. Copy `.env` template and update values:

```powershell
cp .env.example .env
# Edit .env and set MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, etc.
```

3. Run in development mode (uses nodemon + ts-node):

```powershell
npm run dev
```

4. Build and run production locally:

```powershell
npm run build
npm start
```

The server runs by default on `http://localhost:5000` (see `PORT` in `.env`).

---

## Testing

Run the test suite (uses mongodb-memory-server):

```powershell
npm test
```

For watching tests while developing:

```powershell
npm run test:watch
```

---

## API Documentation (Swagger)

Interactive API docs are available at:

- Local: `http://localhost:5000/api-docs`
- Production (replace with your deployment URL): `https://<your-vercel-app>.vercel.app/api-docs`

Use the **Authorize** button in Swagger UI to add a bearer token for protected endpoints.

---

## Deployment (Vercel)

This project includes `vercel.json` and steps to deploy to Vercel. High-level steps:

1. Push your repository to GitHub.
2. Create a MongoDB Atlas cluster and user; note the connection string.
3. Import the repository into Vercel (`vercel.com/new`).
4. Add environment variables in Vercel (see `.env.production` template):

- `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ALLOWED_ORIGINS`, `SOCKET_CORS_ORIGIN`, etc.

5. Deploy and test the API; visit `/api-docs` on your Vercel URL to view Swagger.

Detailed deployment instructions are provided in `VERCEL_DEPLOYMENT.md` and `DEPLOYMENT_CHECKLIST.md` in this repo.

---

## Screenshots

Below are screenshots captured during local testing. The images are in the `ss/` folder of the repository.

1. Auth register / login

![Auth Register](ss/Screenshot%202025-11-27%20124515.png)

2. Create Project (validation example)

![Create Project Validation](ss/Screenshot%202025-11-27%20124901.png)

3. Projects list & activity errors

![Projects list error](ss/Screenshot%202025-11-27%20125142.png)

4. Task status transition (validation)

![Task status validation](ss/Screenshot%202025-11-27%20125318.png)

5. Activity endpoints validation

![Activity endpoints validation 1](ss/Screenshot%202025-11-27%20130341.png)
![Activity endpoints validation 2](ss/Screenshot%202025-11-27%20130427.png)

6. Port-in-use / nodemon output

![Port in use](ss/Screenshot%202025-11-27%20131422.png)
![Nodemon start](ss/Screenshot%202025-11-27%20131807.png)

7. Socket.IO initialization logs

![Socket IO init](ss/Screenshot%202025-11-27%20131954.png)

8. Postman PATCH status error (transition flow)

![Patch status error](ss/Screenshot%202025-11-27%20132347.png)

9. Postman successful change / other logs

![Postman success](ss/Screenshot%202025-11-27%20133026.png)
![More logs](ss/Screenshot%202025-11-27%20134030.png)

10. Additional debug screenshots

![Debug 1](ss/Screenshot%202025-11-27%20135309.png)
![Debug 2](ss/Screenshot%202025-11-27%20135351.png)
![Debug 3](ss/Screenshot%202025-11-27%20135538.png)

> Note: If images do not render on GitHub, ensure the `ss/` folder is included in your repository and filenames are exact (case-sensitive on Linux).

---

## Contributing

Contributions are welcome. Typical workflow:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-change`
3. Make changes and tests
4. Run `npm run build` and `npm test`
5. Open a PR with a description of changes

---

## License

This project is provided under the MIT License.

---

If you want, I can also:

- Generate a ready-to-import Postman collection
- Export a minimal Swagger JSON file for external use
- Produce a short README section showing example cURL commands for each main endpoint

Tell me which of the above you want next and I will add it.


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