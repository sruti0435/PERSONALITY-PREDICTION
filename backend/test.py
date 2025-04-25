import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load .env variables
load_dotenv()

# Fetch MongoDB Atlas URI from .env
mongo_url = os.getenv("MONGODB_URL")
client = MongoClient(mongo_url)

# Connect to DB and Collection
db = client["test"]
collection = db["assessmentresults"]

# Aggregation Pipeline
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

# Run the aggregation
recent_reports = list(collection.aggregate(pipeline))

# Print results
for report in recent_reports:
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



