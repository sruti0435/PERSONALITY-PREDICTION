import os
import requests
from dotenv import load_dotenv
from pymongo import MongoClient
from typing import List, Dict, Any

# Load .env variables
load_dotenv()

API_URL = os.getenv("https://bdb0-27-107-44-50.ngrok-free.app")  # your target API endpoint URL

def get_latest_assignments() -> List[Dict[str, Any]]:
    mongo_url = os.getenv("MONGODB_URL")
    client = MongoClient(mongo_url)
    db = client["test"]
    collection = db["assessmentresults"]

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

    return list(collection.aggregate(pipeline))

def send_report_to_api(report: Dict[str, Any]) -> None:
    try:
        response = requests.post(API_URL, json=report)
        response.raise_for_status()
        print(f"✅ Sent report for User {report['user']}: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to send report for User {report['user']}: {e}")

def print_assignment_info_and_send(reports: List[Dict[str, Any]]) -> None:
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

        # Send the report to API
        send_report_to_api(report)

if __name__ == "__main__":
    latest_reports = get_latest_assignments()
    print_assignment_info_and_send(latest_reports)
