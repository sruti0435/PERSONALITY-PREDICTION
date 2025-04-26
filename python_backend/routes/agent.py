



import os
from fastapi import APIRouter, Request
from langchain_openai import ChatOpenAI

from services.agent_service import AgentService

router = APIRouter()
agent_service = AgentService()


class Agent:
    def __init__(self):
        pass


    @router.post("/generate_questions")
    async def generate_questions(requests: Request):#user_assessment : str, user_score : int, number_of_questions : int,question_type : str)
        
        data = await requests.json()

        
        
        response = await agent_service.generate_questions(data)
        print(response)
        return response
