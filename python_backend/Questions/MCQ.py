
from langchain_openai import ChatOpenAI
from Questions import Question
from Questions.Question import Question_Type
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputToolsParser
from typing import Optional
class MCQ():
    def __init__(self, type:Question_Type):
        self.type = type

    async def generate_question(self, Input : str, user_score : int, number_of_questions : int, llm : Optional[ChatOpenAI] = None):
        
        if not llm:
            raise ValueError("LLM is required passed None ")
        
        prompt  = ChatPromptTemplate.from_template(f"""
                                                   You are a teacher who is generating questions for a user based on their assessment. 
                                                   The user assessment is as follows:
                                                   {Input}
                                                   
                                                   You need to Generate {self.type.value} questions for the user.
                                                   
                                                   The user has scored {user_score}, Based on the user score, generate questions for the user. If it was hard on the user, generate easy questions. If it was easy on the user, generate hard questions.
                                                   
                                                   Return the Quustions in a list of json format. . You should generate {number_of_questions} questions sets of 10 questions each
                                                   
                                                   The json should have the following fields:
                                                   
                                                    "question" : "<question>",
                                                    "options" : "<options>",
                                                    "answer" : "<answer>"
                                                   
                                                   
                                                   No other text should be returned.
                                                   """)
        input = {"Input": Input,"question_type":self.type.value, "user_score": user_score, "number_of_questions": number_of_questions}
        
        chain = prompt | llm 
        response = await chain.ainvoke(input)
        print("response",response)
        return response

