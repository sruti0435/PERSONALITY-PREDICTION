



import asyncio
import os
from typing import Dict, Optional   
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import Questions
from Questions.Question import Question_Type
from Questions.MCQ import MCQ
from Questions.True_False import True_False
from Questions.Fill_Blank import Fill_Blank
from dotenv import load_dotenv

load_dotenv()


class Agent:
    def __init__(self):
        key = os.getenv("OPENAI_API_KEY")
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=key)    
    def access_user_understandling(self, user_assessment : str):
        chat_prompt = ChatPromptTemplate.from_template(f"""
                                                       You are an expert in understanding the user's understanding of the subject.
                                                       You are given a user assessment and you need to understand the user's understanding of the subject.
                                                       You need to return the user's understanding of the subject on a scale of 1 to 10. 
                                                       The user assessment is as follows:
                                                       {user_assessment}
                                                       
                                                       The output should only contain the score and nothing else.
                                                       """)

        chain = chat_prompt | self.llm
        response = chain.invoke({"user_assessment": user_assessment})
        return response.content



    async def generate_questions(self, user_assessment : str, user_score : int, number_of_questions : int,question_type : str):
        if not self.llm:
            raise ValueError("LLM is required passed None ")
        if question_type == "MCQ":
            question = MCQ(Question_Type.MCQ)
        elif question_type == "TRUE_FALSE":
            question = True_False(Question_Type.TRUE_FALSE)
        elif question_type == "FILL_BLANK":
            question = Fill_Blank(Question_Type.FILL_BLANK)
        
        response = await question.generate_question(user_assessment, user_score, number_of_questions,self.llm)
        print(response)
        return response


    def generate_pdf(self, questions : Dict[Question_Type, list[Dict]]):
        
        for question_type, questions in questions.items():
            for question in questions:
                print(question)





if __name__ == "__main__":
    agent = Agent()
    user_assessment = agent.access_user_understandling("I am a student of computer science and engineering")
    print(user_assessment)
    asyncio.run(agent.generate_questions(user_assessment, user_assessment, number_of_questions=10,question_type="FILL_BLANK",llm=agent.llm))
    
