# Python script to connect to MongoDB and use the TypeScript agent

import os
from dotenv import load_dotenv
from pymongo import MongoClient
import subprocess
import json

# Load environment variables from .env file
load_dotenv()


mongo_url = os.getenv("MONGODB_URL")

try:
    # Connect to MongoDB
    client = MongoClient(mongo_url)
    db = client["test"]  # Replace with your actual database name
    collection = db["assessmentresults"]  # Replace with your actual collection name
    

    # Query to get recent quiz results
    pipeline = [
        {"$sort": {"timestamp": -1}},  # Sort by most recent
        {"$limit": 10}  # Get the 10 most recent results
    ]
    
    recent_results = list(collection.aggregate(pipeline))
    
    if not recent_results:
        print("No quiz results found in the database.")
    else:
        for result in recent_results:
            user_id = result.get("userId", "Unknown")
            user_assessment = result.get("assessment", "")
            score = result.get("score", 0)
            
            print(f"Processing user: {user_id}")
            print(f"Assessment: {user_assessment[:50]}..." if len(user_assessment) > 50 else f"Assessment: {user_assessment}")
            print(f"Score: {score}")
            
            # Prepare data for the TypeScript agent
            agent_input = {
                "userId": user_id,
                "assessment": user_assessment,
                "score": score,
                "numberOfQuestions": 5,
                "questionType": "MCQ"  # You can change this to TRUE_FALSE or FILL_BLANK
            }
            
            # Write the input to a temporary file
            with open("agent_input.json", "w") as f:
                json.dump(agent_input, f)
            
            # Call the TypeScript agent (assuming it's compiled to JavaScript)
            # This assumes you have Node.js installed
            try:
                # Command to run the agent with the input file
                cmd = ["node", "--require", "dotenv/config", "./dist/agent.js", "agent_input.json"]
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("Agent output:")
                    print(result.stdout)
                    
                    # Parse and save the generated questions back to MongoDB
                    try:
                        generated_questions = json.loads(result.stdout)
                        # Save the generated questions to MongoDB
                        questions_collection = db["generated_questions"]
                        questions_collection.insert_one({
                            "userId": user_id,
                            "questions": generated_questions,
                            "timestamp": datetime.now()
                        })
                        print(f"Successfully saved generated questions for user {user_id}")
                    except json.JSONDecodeError:
                        print("Could not parse agent output as JSON")
                else:
                    print("Error running the agent:")
                    print(result.stderr)
            except Exception as e:
                print(f"Failed to run the agent: {str(e)}")
    
except Exception as e:
    print(f"MongoDB Error: {str(e)}")
    print("Make sure MongoDB is running and the connection string is correct.")