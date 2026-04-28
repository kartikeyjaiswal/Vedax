# 🚀 Vedax (formerly EcoGamify) - Remaining Project Tasks

Based on the project's current architecture and recent bug-fixing priorities, here is a categorized checklist of remaining tasks required to reach a stable, production-ready release.

## 1. 🐛 Bug Fixes & Stability
- [x] **AI Service (FastAPI) 500 Errors:** Ensure the async Gemini API calls inside `ai-service/app/main.py` handle timeouts, rate limits, and unparseable completion formats to prevent `500 Internal Server Error` responses.
- [x] **Frontend 404 & UI Styling Issues:** Address and verify fixes for routing 404s and missing CSS styles that occur when running the application purely via Node (without Docker).
- [x] **User Payload Consistency:** Ensure that `userId` and session persistence (`eco_session`) are correctly and securely being passed to the backend, especially for submission tracking and user level evaluation.

## 2. 🔌 Appwrite Backend & Data Sync
- [x] **Dynamic Data Population:** Replace fallback/mock statistics in `Dashboard.jsx` (such as the Activity Chart baseline calculations) with strictly dynamic data pulled from user stats and history.
- [x] **Admin Task Creation:** Verify that task creation schema requests in `AdminDashboard.jsx` perfectly align with the Appwrite `Tasks` collection definitions, ensuring no `collegeId` mismatch errors occur.
- [x] **Setup Script Validation:** Run `npm run setup` locally to confirm all Appwrite Collections, Attributes, and Indexes are correctly configured out-of-the-box for fresh installations.

## 3. 🧠 AI Feature Refinement
- [x] **Image Verification Robustness:** Double-check the `POST /verify-image` capability with varying qualities of user "proof" photos to ensure Gemini Vision responds accurately and securely.
- [x] **Chatbot State:** Ensure the EcoBot properly consumes conversation `history` to keep track of the user's ongoing environmental queries.

## 4. 🧪 Testing & QA Validation
- [x] **Component Tests:** Add Jest or React Testing Library coverage for foundational React components (like `XPProgressBar` and `SubmissionRow`).
- [x] **E2E Automation:** Implement an E2E testing framework (e.g., Selenium/Cypress) to automate the core path: *Register -> Assign College -> View Task -> Submit Proof -> Admin Review*.

## 5. 🚢 Environment & Deployment Prep
- [ ] **Production Ready Builds:** Validate `npm run build` for the frontend and ensure bundle sizes are within optimal parameters.
- [ ] **Docker Orchestration:** Ensure `docker-compose.yml` safely orchestrates the Vite server, Node/Express API, and FastAPI services via correct networking channels if the user opts for a containerized deploy.
- [ ] **Environment Documentation:** Confirm that `.env.example` templates exist for the frontend, backend, and ai-service to improve the developer onboarding experience.
