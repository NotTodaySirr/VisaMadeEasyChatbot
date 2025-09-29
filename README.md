# VisaMadeEasyChatbot

A full‑stack Visa assistance app: Flask API (auth, chat with SSE streaming, checklists, file uploads, Celery tasks) + Vite/React frontend.

## Overview
Manage visa‑related conversations, tasks/checklists, and documents. JWT‑based auth, real‑time chat via SSE, checklist management, and validated file uploads. Background jobs with Celery + Redis.

## Features
- Chat with a consultant chatbot about visa planning
- Manage checklists, files, documentation related to Visa


## Tech Stack
- Backend: Flask, SQLAlchemy, Alembic, Celery, Redis, PostgreSQL
- Frontend: Vite, React, Axios
- Ops: Docker, Docker Compose

## Prerequisites
- Python: 3.10+
- Node: 18+
- Redis, PostgreSQL (or Docker Compose)

## Environment Variables
Backend (`backend/.env`):
- `FLASK_CONFIG` (development|testing|production)
- `SECRET_KEY`, `JWT_SECRET_KEY`
- `DEV_DATABASE_URL` / `TEST_DATABASE_URL` / `DATABASE_URL`
- `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`
- `UPLOAD_FOLDER`, `MAX_CONTENT_LENGTH`
- `GEMINI_API_KEY`, `AI_MODEL`

Frontend (`frontend/.env`):
- `VITE_API_URL` (e.g., `http://localhost:5000`)

## Setup
Backend
1. `pip install -r backend/requirements.txt`
2. Configure `backend/.env`
3. Initialize DB (dev): `python backend/main.py init_db` or use Alembic

Frontend
1. `cd frontend && npm ci`
2. Configure `frontend/.env`
3. Run: `npm run dev`

Run locally
- Backend: `python backend/main.py` → http://localhost:5000
- Frontend: `cd frontend && npm run dev` → http://localhost:5173

## Docker(recommended)
From repo root: `docker-compose up --build`
- Services: postgres, redis, backend, frontend, celery-worker, celery-beat
- Frontend: http://localhost:5173, Backend: http://localhost:5000