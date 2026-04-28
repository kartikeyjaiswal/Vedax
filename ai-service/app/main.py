from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import quiz, chatbot, verify_image, recommend, eco_score
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="EcoGamify AI Service",
    description="AI microservice for EcoGamify platform using Google Gemini",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router)
app.include_router(chatbot.router)
app.include_router(verify_image.router)
app.include_router(recommend.router)
app.include_router(eco_score.router)

@app.get("/")
async def root():
    return {"service": "EcoGamify AI Service", "status": "running", "ai": "Google Gemini"}

@app.get("/health")
async def health():
    return {"status": "ok"}
