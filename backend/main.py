"""
Main application entry point for the FastAPI backend.

This file:
- Initializes the FastAPI app
- Registers all API routers (data & strategy)
- Configures CORS for frontend-backend integration
- Exposes a health check root endpoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import data
from backend.routers import strategy

# Initialize FastAPI app
app = FastAPI()

# Register routers from different modules
app.include_router(strategy.router)
app.include_router(data.router)

# Enable CORS to allow requests from frontend (e.g., React, Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # Allow all origins (adjust for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """
    Health check endpoint to verify backend is running.

    Returns:
        dict: A simple confirmation message.
    """
    return {"message": "Backend is working!"}
