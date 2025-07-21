# Food Visualization Backend

A simple Flask backend that handles OpenAI API calls securely.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your OpenAI API key:
```bash
cp env.example .env
# Edit .env and add your OpenAI API key
```

3. Run the backend:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

- `POST /api/analyze-menu` - Analyzes menu text and extracts dishes
- `POST /api/generate-images` - Generates images for dishes
- `GET /api/health` - Health check endpoint

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (default: 5000) 