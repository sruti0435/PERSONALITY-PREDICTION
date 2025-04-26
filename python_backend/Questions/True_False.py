
from langchain_openai import ChatOpenAI
from Questions.Question import Question_Type
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputToolsParser
from typing import Optional
class True_False():
    def __init__(self, type:Question_Type):
        self.type = type

    async def generate_question(self, user_assessment : str, user_score : int, number_of_questions : int, llm : Optional[ChatOpenAI] = None):
        
        if not llm:
            raise ValueError("LLM is required passed None ")
        
        prompt  = ChatPromptTemplate.from_template(f"""
                                                   You are a teacher who is generating questions for a user based on their assessment. 
                                                   The user assessment is as follows:
                                                   {user_assessment}
                                                   
                                                   You need to Generate {self.type} questions for the user.
                                                   
                                                   The user has scored {user_score}, Based on the user score, generate questions for the user. If it was hard on the user, generate easy questions. If it was easy on the user, generate hard questions.
                                                   
                                                   Return the Questions in a list of json format. You should generate {number_of_questions} questions sets of 10 questions each
                                                   
                                                   The json should have the following fields:
                                                   
                                                   "question" : "question",
                                                   "answer" : "True or False"
                                                   
                                                   
                                                   No other text should be returned.
                                                   """)
        
        chain = prompt | llm
        response = await chain.ainvoke({"user_assessment": user_assessment, "user_score": user_score, "number_of_questions": number_of_questions})
        return response

