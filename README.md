# Projectify

A modern, full-stack project management application built with Next.js and Flask. Projectify helps teams organize projects, track user stories with Kanban boards, manage team members, and stay on top of deadlines.

## Features

- **User Authentication** - Secure registration and login system with JWT-based sessions
- **Project Management** - Create, update, and organize projects with deadlines and status tracking
- **Kanban Board** - Drag-and-drop user stories across status columns (To Do, In Progress, Done)
- **User Stories** - Create detailed user stories with descriptions, estimated time, and assignees
- **Team Management** - Assign team members to projects and user stories
- **Calendar View** - Visual calendar for tracking project deadlines and events
- **File Attachments** - Upload and manage project documents and attachments
- **Comments** - Collaborate with team members through story comments
- **Search** - Search projects and team members across the platform
- **Profile Management** - User profiles with department, contact info, and settings

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with Turbopack
- **UI Library**: React 19
- **State Management**: Redux Toolkit with Redux Persist
- **Styling**: Tailwind CSS 4
- **Drag & Drop**: react-dnd
- **Calendar**: react-big-calendar
- **Icons**: Lucide React

### Backend
- **Framework**: Flask 3.1
- **Database**: PostgreSQL 14
- **ORM**: Raw SQL with stored procedures
- **Authentication**: PyJWT, bcrypt
- **File Storage**: Local filesystem with Cloudinary support
- **CORS**: Flask-CORS

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 14

## Project Structure

```
Projectify/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── components/  # Reusable React components
│   │   │   ├── dashboard/   # Dashboard page
│   │   │   ├── calendar/    # Calendar view
│   │   │   ├── members/     # Team members page
│   │   │   ├── settings/    # User settings
│   │   │   └── ...
│   │   ├── lib/api/         # API client functions
│   │   └── store/           # Redux store and slices
│   ├── Dockerfile
│   └── package.json
├── backend/                  # Flask backend application
│   ├── app/
│   │   ├── routes/          # API route handlers
│   │   └── db/              # Database configuration and stored procedures
│   ├── uploads/             # File upload storage
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py               # Application entry point
└── docker-compose.yml       # Docker orchestration
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)
- PostgreSQL 14+ (or use Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/ZunairaAli18/Projectify.git
   cd Projectify
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5000

### Local Development

#### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   export DATABASE_URL=postgresql://postgres:admin123/?@localhost:5432/postgresdb
   ```

5. **Run the backend server**
   ```bash
   python run.py
   ```
   The API will be available at http://localhost:5000

#### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   export NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | User login |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | Get all projects |
| POST | `/addProject` | Create a new project |
| POST | `/<project_id>/updateProject` | Update project details |
| GET | `/<project_id>/getProjectMembers` | Get project members |
| POST | `/<project_id>/assignMember` | Assign member to project |
| PUT | `/projects/<project_id>/status` | Update project status |

### User Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user-stories` | Create a new user story |
| GET | `/user-stories/<story_id>` | Get user story details |
| PUT | `/user-stories/<story_id>/edit` | Update user story |
| POST | `/user-stories/all` | Get all stories for a project |
| POST | `/user-story/<story_id>/update-status` | Update story status |

### Events & Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events` | Create a new event |
| GET | `/events/<user_id>` | Get user events |
| POST | `/update-event-deadline` | Update event deadline |
| DELETE | `/delete-event/<event_id>` | Delete an event |

### Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload-attachment` | Upload a file attachment |
| GET | `/download-attachment` | Download an attachment |
| POST | `/assign-attachments` | Assign attachments to project |

### Users & Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/usersList` | Get all users |
| POST | `/my-profile` | Get user profile |
| PUT | `/update-profile` | Update user profile |
| POST | `/change-password` | Change user password |
| GET | `/departments` | Get all departments |

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:admin123/?@db:5432/postgresdb` |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `frontend` | 3001:3000 | Next.js frontend |
| `backend` | 5000:5000 | Flask API server |
| `db` | 5431:5432 | PostgreSQL database |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Flask](https://flask.palletsprojects.com/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
