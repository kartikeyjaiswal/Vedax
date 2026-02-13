from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "AI Service is running"}

@app.post("/verify-task")
def verify_task(image_url: str):
    # Placeholder for AI logic
    return {"verified": True, "confidence": 0.95}
