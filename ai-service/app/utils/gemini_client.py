import os
import httpx
import google.generativeai as genai
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def generate_text(prompt: str, model_name: str = "gemini-flash-latest", response_mime_type: str = "text/plain") -> str:
    try:
        model = genai.GenerativeModel(model_name)
        
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=4096,
            temperature=0.7,
            response_mime_type=response_mime_type
        )
        
        response = await model.generate_content_async(
            prompt,
            generation_config=generation_config
        )
        
        if not response.parts:
            print(f"Gemini API Error (No candidates): {response}")
            raise HTTPException(status_code=500, detail="Gemini API returned no candidates. This usually means the response was blocked by safety settings.")
            
        return response.text
        
    except httpx.HTTPError as e:
        print(f"Gemini API Network Error: {e}")
        raise HTTPException(status_code=502, detail="Error communicating with AI service provider.")
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Failed to retrieve valid response from AI service.")
