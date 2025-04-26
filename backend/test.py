import os
from dotenv import load_dotenv
from pymongo import MongoClient
from typing import List, Dict, Any

# Load .env variables
load_dotenv()

def get_latest_assignments() -> List[Dict[str, Any]]:
    # Connect to MongoDB
    mongo_url = os.getenv("MONGODB_URL")
    client = MongoClient(mongo_url)

    # Select DB and Collection
    db = client["test"]
    collection = db["assessmentresults"]

    # Define aggregation pipeline
    pipeline = [
        { "$sort": { "createdAt": -1 } },
        {
            "$group": {
                "_id": "$user",
                "latestReport": { "$first": "$$ROOT" }
            }
        },
        { "$replaceRoot": { "newRoot": "$latestReport" } }
    ]

    # Execute the pipeline
    return list(collection.aggregate(pipeline))


def print_assignment_info(reports: List[Dict[str, Any]]) -> None:
    for report in reports:
        print("User ID:", str(report['user']))
        print("Score:", report['score'], "/", report['maxScore'])
        print("Percentage:", report['percentage'])
        print("Time Taken:", report['timeTaken'], "seconds")
        print("Answers:")
        for answer in report['answers']:
            print(f"  - Q: {answer['question']}")
            print(f"    Your Answer: {answer['userAnswer']}")
            print(f"    Correct: {answer['correctAnswer']}")
            print(f"    Correct?: {answer['isCorrect']}")
        print("-" * 50)


if __name__ == "__main__":
    latest_reports = get_latest_assignments()
    print_assignment_info(latest_reports)
