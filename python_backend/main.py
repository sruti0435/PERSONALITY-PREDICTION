from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi import APIRouter
from routes import rag, agent

# Create FastAPI app
app = FastAPI(
    title="FastAPI Backend",
    description="A simple FastAPI backend application",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(rag.router, prefix="/rag")
app.include_router(agent.router, prefix="/agent")
# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI Backend"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include routers from routes folder
# from routes import some_router
# app.include_router(some_router.router)

if __name__ == "__main__":
    # Run the application with Uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 