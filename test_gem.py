import google.generativeai as genai
import os
import asyncio
from dotenv import load_dotenv

load_dotenv(r"d:\Vedax\ai-service\.env")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

async def main():
    try:
        model = genai.GenerativeModel("gemini-flash-latest")
        config = genai.types.GenerationConfig(max_output_tokens=512, temperature=0.7)
        res = await model.generate_content_async("hi", generation_config=config)
        print("Success:", res.text)
    except Exception as e:
        print("Error Type:", type(e))
        print("Error Details:", str(e))

asyncio.run(main())
