from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os
from auth import verify_clerk_jwt

# Import routes
from routes.square import router as square_router

# Load environment variables
load_dotenv()

app = FastAPI(title="BookSmartly API", description="API for BookSmartly application")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(square_router)

@app.get("/")
async def root():
    return {"message": "Welcome to BookSmartly API"}

@app.get("/health")
@app.get("/health/protected")
async def health_check_protected(payload=verify_clerk_jwt):
    return {"status": "healthy", "user": payload}
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)