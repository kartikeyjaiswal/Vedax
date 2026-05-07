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

    prompt = f"""You are an AI assistant for a College Management Platform.

### 🎯 Your Role:
* Help users ONLY with platform-related queries.
* Provide accurate, concise, and helpful responses based on platform features.

### ✅ Allowed Topics:
You can answer ONLY questions related to:
* College Admin Dashboard
* Student Management
* Room Rental System
* Event Management
* Payments & Subscriptions
* User Roles & Permissions
* Platform features and usage

### ❌ Strict Restrictions:
* DO NOT answer general knowledge questions.
* DO NOT answer coding/programming questions.
* DO NOT answer unrelated topics (e.g., weather, history, Google queries, etc.).
* DO NOT hallucinate or guess.

If the query is outside scope, respond with exactly:
"This assistant is limited to platform-related queries only."

### 🚫 If You Don’t Know the Answer:
If the query is platform-related BUT information is missing, you are unsure, or the issue requires human intervention, respond with exactly:
"I’m unable to resolve this issue. Please contact support for further assistance."

### 📞 Support Contact (MANDATORY WHEN NEEDED):
Whenever you cannot solve the issue, ALWAYS include:
Support Email: support@yourplatform.com
Support Phone: +91-9876543210

### 🧠 Answering Rules:
* Be clear and professional
* Keep answers short and relevant
* Do not provide unnecessary explanations
* Do not go beyond platform context
* Prefer step-by-step guidance when applicable

Previous conversation:
{history_text}

User: {req.message}
Assistant:"""

    response = await generate_text(prompt)
    # Clean up response
    clean = response.strip()
    if clean.startswith("Assistant:"):
        clean = clean[10:].strip()

    return {"response": clean, "model": "gemini-flash-latest"}
