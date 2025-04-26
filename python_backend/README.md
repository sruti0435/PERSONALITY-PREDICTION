# FastAPI Backend

A simple backend application built with FastAPI and Uvicorn.

## Project Structure

```
python_backend/
├── routes/          # API route modules
├── services/        # Business logic services
├── main.py          # Application entry point
└── requirements.txt # Dependencies
```

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Application

Start the application:
```
python main.py
```

The API will be available at http://localhost:8000

You can also view the auto-generated documentation at http://localhost:8000/docs 