# EcoGamify 🌍

**AI-Powered Gamified Environmental Learning Platform**

> Built with React + Vite, Node.js/Express, Python FastAPI, Appwrite, and Google Gemini AI.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Appwrite Cloud account

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
# → http://localhost:3001
```

### 3. AI Service (Python)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
```

### 4. Setup Appwrite Database (first run only)
```bash
cd backend
npm run setup
```

---

## 🏗️ Architecture

```
frontend/   → React 18 + Vite + Tailwind + Framer Motion + Chart.js
backend/    → Node.js + Express + Appwrite Server SDK
ai-service/ → Python FastAPI + Google Gemini AI
```

---

## 🔑 Environment Variables

### frontend/.env
```
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_API_URL=http://localhost:3001
VITE_AI_URL=http://localhost:8000
```

### backend/.env
```
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
AI_SERVICE_URL=http://localhost:8000
```

### ai-service/.env
```
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🌿 Features

| Feature | Status |
|---------|--------|
| Auth (Email/Password) | ✅ |
| Role-based access (Student/Admin/Super Admin) | ✅ |
| Multi-tenant college system | ✅ |
| XP & Levels system | ✅ |
| Badges & Achievements | ✅ |
| Daily streak tracking | ✅ |
| Global + College Leaderboard | ✅ |
| Task submission with image proof | ✅ |
| AI Quiz Generator (Gemini) | ✅ |
| AI Chatbot (EcoBot) | ✅ |
| Image verification (Gemini Vision) | ✅ |
| Task recommendations | ✅ |
| Eco Score + impact calculator | ✅ |
| Dark mode | ✅ |
| Mobile responsive + bottom nav | ✅ |
| Admin dashboard | ✅ |
| Super admin panel | ✅ |

---

## 📡 API Reference

### Backend (port 3001)
| Endpoint | Description |
|----------|-------------|
| POST /api/auth/register | Register + assign college |
| GET /api/auth/me | Get current user |
| GET /api/tasks | List tasks (filtered) |
| POST /api/submissions | Submit task proof |
| PATCH /api/submissions/:id/approve | Admin approve |
| GET /api/leaderboard/global | Global rankings |
| GET /api/leaderboard/college/:id | College rankings |
| POST /api/colleges | Register college |
| POST /api/quizzes/generate | AI quiz generation |
| POST /api/ai/chatbot | EcoBot chat |

### AI Service (port 8000)
| Endpoint | Description |
|----------|-------------|
| POST /generate-quiz | Generate MCQ via Gemini |
| POST /chatbot | Environmental Q&A |
| POST /verify-image | Validate proof image |
| POST /recommend-tasks | Personalized task suggestions |
| POST /eco-score | Calculate environmental impact |

---

## 🎮 User Roles

| Role | Permissions |
|------|------------|
| **Common** | Browse global tasks, quizzes, leaderboard |
| **Student** | All above + college tasks + submissions |
| **College Admin** | All above + create tasks + approve submissions |
| **Super Admin** | Everything + manage all colleges + global config |

---

## 🌍 Production Deployment

Vedax is configured for seamless deployment using Docker Compose. The configuration uses an Nginx proxy for the frontend to securely route API traffic to the backend, completely bypassing CORS issues. The AI service remains secure and inaccessible from the outside world.

### Steps to deploy:

1. **Clone the repository** on your server.
2. **Setup Environment Variables**:
   Create the required `.env` files based on the examples:
   - `backend/.env` (Requires `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, etc.)
   - `ai-service/.env` (Requires `GEMINI_API_KEY`)
3. **Build and start the containers**:
   ```bash
   docker-compose up -d --build
   ```
4. **Access the application**:
   The Nginx frontend will be exposed on port `80`. Simply visit your server's IP address or domain.

**Note**: All API requests from the frontend are routed automatically via Nginx (using `VITE_API_URL=/`), so you don't need to configure CORS or specify the frontend URL for it to communicate with the backend!
