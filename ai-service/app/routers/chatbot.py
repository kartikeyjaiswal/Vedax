from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.utils.gemini_client import generate_text

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Message]] = []

@router.post("/chatbot")
async def chatbot(req: ChatRequest):
    history_text = ""
    if req.history:
        for msg in req.history[-10:]:  # Last 10 messages for deeper context
            prefix = "User" if msg.role == "user" else "EcoBot"
            history_text += f"{prefix}: {msg.content}\n"

    prompt = f"""You are EcoBot, an enthusiastic and knowledgeable AI assistant for Vedax, a gamified environmental learning platform. 

Your personality:
- Friendly, encouraging, and passionate about the environment
- Use eco-related emojis occasionally (🌿, 🌍, ♻️, 🌱, etc.)
- Give concise, actionable answers (2-4 sentences max)
- Always relate answers to practical eco-actions users can take
- If asked about non-environmental topics, kindly redirect to eco topics

Previous conversation:
{history_text}

User: {req.message}
EcoBot:"""

    response = await generate_text(prompt)
    # Clean up response
    clean = response.strip()
    if clean.startswith("EcoBot:"):
        clean = clean[7:].strip()

    return {"response": clean, "model": "gemini-flash-latest"}
