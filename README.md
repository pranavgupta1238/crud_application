# React + MongoDB CRUD Demo

This project demonstrates:

- CRUD with a React frontend and Express/MongoDB backend
- One-to-many relationship: one `Author` can have many `Book` records
- Many-to-many relationship: many `Student` records can join many `Course` records
- Docker Compose setup for running frontend, backend, and MongoDB together
- Jenkins pipeline for continuous integration

## Tech stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- Docker + Docker Compose
- Jenkins

## Project structure

```text
frontend/   React app
backend/    Express API with Mongoose models
docker-compose.yml
```

## Run locally

You need MongoDB running locally on port `27017` for this option.

1. Backend environment:

```bash
cd backend
cp .env.example .env
```

2. Frontend environment:

```bash
cd frontend
cp .env.example .env
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

This is the easiest way to run the full application because Docker Compose starts MongoDB, the API, and the React frontend together.

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`
- MongoDB inside Docker network: `mongodb://mongo:27017/react_mongo_demo`
- MongoDB from your host machine: `mongodb://localhost:27018/react_mongo_demo`

The backend container uses:

```text
MONGODB_URI=mongodb://mongo:27017/react_mongo_demo
```

## Jenkins integration

The project includes a `Jenkinsfile` at the repository root. The pipeline:

- installs backend dependencies with `npm ci`
- installs frontend dependencies with `npm ci`
- validates backend JavaScript syntax
- builds the React frontend
- validates the Docker Compose configuration

### Jenkins setup

1. Install Jenkins or run Jenkins with Docker.
2. Install the Jenkins NodeJS plugin.
3. In Jenkins, go to `Manage Jenkins` > `Tools` and add a NodeJS installation named `NodeJS 20`.
4. Create a new Pipeline job.
5. Point the job to this Git repository.
6. Set the pipeline script path to:

```text
Jenkinsfile
```

Run the Jenkins job. A successful build confirms that the backend, frontend, and Docker Compose configuration are valid.

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
