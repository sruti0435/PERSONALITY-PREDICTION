from abc import ABC, abstractmethod
from enum import Enum
from typing import Optional

from langchain_openai import ChatOpenAI

class Question_Type(Enum):
    MCQ = "MCQ"
    TRUE_FALSE = "True_False"
    FILL_BLANK = "Fill_Blank"

class Question(ABC):
    
    def __init__(self, type:str):
        self.type = Question_Type(type)

    @abstractmethod
    def generate_question(self, user_assessment : str, user_score : int, number_of_questions : int,llm : Optional[ChatOpenAI] = None):
        pass


        