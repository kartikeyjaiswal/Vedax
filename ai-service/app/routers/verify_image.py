from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter()

class ImageVerifyRequest(BaseModel):
    image_url: str
    task_type: Optional[str] = "general"

@router.post("/verify-image")
async def verify_image(req: ImageVerifyRequest):
    """
    Lightweight image verification using Gemini Vision.
    Checks if the uploaded image matches the claimed eco-task.
    """
    try:
        import google.generativeai as genai
        import os

        model = genai.GenerativeModel("gemini-flash-latest")

        # Download image
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(req.image_url)
            if resp.status_code != 200:
                return {"verified": True, "confidence": 0.7, "reason": "Could not fetch image - auto-approved"}
            image_data = resp.content

        import PIL.Image
        import io
        img = PIL.Image.open(io.BytesIO(image_data))

        prompt = f"""Analyze this image for an eco-challenge task verification.
Task type: {req.task_type}

Determine if this image shows genuine environmental/eco activity related to the task type.
Examples of valid activities: planting trees, recycling, clean energy, water conservation, clean-up drives, vegetarian meals.

Respond with ONLY valid JSON containing these exact keys: "verified" (boolean), "confidence" (number 0.0-1.0), "reason" (short string), "detected_activity" (short string)"""

        response = await model.generate_content_async(
            [prompt, img],
            generation_config=genai.types.GenerationConfig(response_mime_type="application/json")
        )
        import json
        text = response.text.strip()
        result = json.loads(text)
        return result

    except Exception as e:
        # If verification fails for any reason, default to approval with low confidence
        return {
            "verified": True,
            "confidence": 0.6,
            "reason": f"Auto-approved (verification error: {str(e)[:50]})",
            "detected_activity": "unknown"
        }
