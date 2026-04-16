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

4. **Create a `.env` file**
   ```
   DATABASE_URL=postgresql://postgres:admin123/?@localhost:5432/postgresdb
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

3. **Create a `.env.local` file**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000

## License

MIT
