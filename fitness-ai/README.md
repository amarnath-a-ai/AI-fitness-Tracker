# AI Fitness & Health Tracker

A production-quality AI-powered fitness and health tracking platform inspired by HealthifyMe.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Node.js + Express + TypeScript + MongoDB
- **AI Service**: Python FastAPI + Scikit-learn
- **Database**: MongoDB
- **Deployment**: Docker + Docker Compose + NGINX

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd fitness-ai

# Start with Docker Compose
docker-compose up --build

# Or start individually:

# Backend
cd server && npm install && npm run dev

# Frontend
cd client && npm install && npm run dev

# AI Service
cd ai-service && pip install -r requirements.txt && uvicorn main:app --reload
```

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fitai.com | Admin@123 |
| User | john@fitai.com | User@123 |
| Trainer | trainer@fitai.com | Trainer@123 |

## Environment Variables

Copy `.env.example` to `.env` in both `server/` and `ai-service/` directories.

## Project Structure

```
fitness-ai/
├── client/          # React frontend
├── server/          # Node.js backend
├── ai-service/      # Python AI service
├── database/        # Seed data & scripts
├── docs/            # Documentation
└── docker-compose.yml
```

## License

MIT
