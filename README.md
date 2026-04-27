# React + MongoDB CRUD Demo

This project demonstrates:

- CRUD with a React frontend and Express/MongoDB backend
- One-to-many relationship: one `Author` can have many `Book` records
- Many-to-many relationship: many `Student` records can join many `Course` records
- Docker Compose setup for running frontend, backend, and MongoDB together

## Tech stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- Docker + Docker Compose

## Project structure

```text
frontend/   React app
backend/    Express API with Mongoose models
docker-compose.yml
```

## Run locally

1. Backend environment:

```bash
cd backend
copy .env.example .env
```

2. Frontend environment:

```bash
cd frontend
copy .env.example .env
```

3. Install dependencies and start the backend:

```bash
cd backend
npm install
npm run dev
```

4. Start the frontend in a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:5000`.

## Run with Docker

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

## Relationship explanation

### One-to-many

- One author can write many books.
- Each book belongs to one author.

In MongoDB this is modeled by storing `author` on each `Book` document.

### Many-to-many

- One student can enroll in many courses.
- One course can have many students.

In MongoDB this is modeled with reference arrays:

- `Student.courses`
- `Course.students`

The backend keeps both sides in sync when course enrollments are created or updated.
