



from agent import Agent


class AgentService:
    def __init__(self):
        pass

    async def generate_questions(self, data):
        try:
            self.agent = Agent()
            user_assessment = data["user_assessment"]
            user_score = data["user_score"]
            number_of_questions = data["number_of_questions"]
            question_type = data["question_type"]
            user_assessment = self.agent.access_user_understandling(user_assessment)
            print(user_assessment)
            return await self.agent.generate_questions(user_assessment, user_score, number_of_questions,question_type)
        except Exception as e:
            return {"error": str(e)}

