# PrepPilot – AI-Powered Interview Preparation Platform

PrepPilot is an AI-powered interview preparation platform designed to help developers prepare for technical interviews through structured learning, personalized practice, and progress tracking.

The platform brings together interview preparation resources, AI-assisted learning, coding practice organization, and performance monitoring in one place.

## Key Features

- **AI-Powered Interview Assistance:** Generate interview questions and receive intelligent assistance during preparation.
- **Structured Preparation:** Organize interview preparation through roadmaps and topic-wise learning.
- **Question Bank:** Explore and filter interview questions based on relevant topics.
- **Progress Tracking:** Monitor preparation activities and learning progress.
- **Task Management:** Create and manage interview preparation goals.
- **PDF Reports:** Export preparation progress and reports.

## Technology Stack

- **Frontend:** React, Vite, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **AI Integration:** OpenRouter API

## Project Structure

```text
PrepPilot-Interview-Studio/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Debajyoti8/PrepPilot-Interview-Studio.git

cd PrepPilot-Interview-Studio
```

### 2. Install Dependencies

Install the frontend dependencies:

```bash
cd frontend
npm install
```

Install the backend dependencies:

```bash
cd ../backend
npm install
```

### 3. Environment Configuration

Create `.env` files in the frontend and backend directories as required by the application.

Configure the necessary environment variables, including database connection details, authentication secrets, and API keys.

Never commit sensitive credentials to GitHub.

### 4. Run the Application

Start the backend and frontend using their respective development scripts.

```bash
npm run dev
```

Run the command from the appropriate project directory.

