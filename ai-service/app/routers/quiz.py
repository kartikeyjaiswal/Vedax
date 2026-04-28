from fastapi import APIRouter
from pydantic import BaseModel
from app.utils.gemini_client import generate_text
import json, re

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str
    count: int = 10

@router.post("/generate-quiz")
async def generate_quiz(req: QuizRequest):
    prompt = f"""Generate {req.count} multiple choice questions about "{req.topic}" related to environmental science and sustainability.

Return ONLY a valid JSON array. Each question must have:
- "question": string
- "options": array of exactly 4 strings
- "correct": integer (0-3, index of correct answer)
- "explanation": string (brief explanation)

Example format:
[
  {{
    "question": "What is the main greenhouse gas?",
    "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"],
    "correct": 1,
    "explanation": "CO2 is the primary greenhouse gas from human activities."
  }}
]

Topic: {req.topic}
Return ONLY the JSON array, no markdown, no extra text."""

    try:
        raw = await generate_text(prompt, response_mime_type="application/json")
        # Extract JSON from response
        clean = re.sub(r'```(?:json)?', '', raw).strip()
        questions = json.loads(clean)
        # Add sequential IDs
        for i, q in enumerate(questions):
            q["id"] = i + 1
        return {"questions": questions, "topic": req.topic, "count": len(questions)}
    except json.JSONDecodeError:
        # Fallback questions
        return {
            "questions": [
                {
                    "id": 1,
                    "question": f"What is a key aspect of {req.topic}?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct": 0,
                    "explanation": f"This relates to {req.topic} fundamentals."
                }
            ],
            "topic": req.topic,
            "count": 1
        }
