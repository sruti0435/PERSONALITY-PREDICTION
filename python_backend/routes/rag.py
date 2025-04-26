
from fastapi import APIRouter, Request
from services.rag_service import RAGService

router = APIRouter()

rag_service = RAGService()


@router.post("/ingest")
async def ingest(request: Request):
    
    # Data should contain File objects 
    
    
    data = await request.json()
    
    rag_service.ingest(data["path"])
    
    return {"message": "RAG request received"}


@router.post("/retrieve")
async def retrieve(request: Request):
    
    data = await request.json()
    
    return rag_service.retrieve(data["query"])

