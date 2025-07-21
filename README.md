# AI-Powered Food Visualization

A web application that uses AI to analyze food menus and generate appetizing images of dishes. Users can upload or take photos of restaurant menus, and the app will extract the top 5 dishes and generate photorealistic images for each. 

The WebSite - https://gastro-vista-ai.lovable.app/

<img width="942" height="787" alt="Screenshot 2025-07-21 at 09 20 46" src="https://github.com/user-attachments/assets/eeb3083b-26d1-4d3a-b8df-6e97b7b37da2" />


## Features

- **OCR Text Extraction**: Uses Tesseract.js to extract text from uploaded menu images
- **AI Menu Analysis**: Leverages ChatGPT to verify if the image is a food menu and extract the top 5 dishes
- **Image Generation**: Uses Replicate Stable Diffusion (SD) to create photorealistic, appetizing images of each dish at 512x512 resolution
- **Responsive Design**: Modern, mobile-friendly UI with loading states and error handling
- **Secure API Handling**: OpenAI API calls are handled securely through a Python backend
- **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

### Frontend
- **React (TypeScript)**: Modern UI framework
- **Vite**: Fast development server and build tool
- **Tesseract.js**: Client-side OCR for text extraction
- **Axios**: HTTP client for API requests
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **Python Flask**: Simple backend API server
- **OpenAI API**: GPT-3.5-turbo for menu analysis
- **Replicate API**: Stable Diffusion (512x512) for image generation
- **Flask-CORS**: Cross-origin resource sharing support

## Getting Started

### Prerequisites
- Docker and Docker Compose
- OpenAI API key
- Replicate API token (for image generation)

### Quick Start (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Powered_Food_Visualization
   ```

2. **Setup environment**
   ```bash
   # Create backend environment file
   cp backend/env.example backend/.env
   # Edit backend/.env and add your OpenAI API key and Replicate API token
   ```
   - Get your Replicate API token from https://replicate.com/account/api-tokens

3. **Run with Docker Compose (Production)**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8002/api/health

5. **Stop the application**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

## Usage

1. **Upload or Capture Image**: Click "Upload Image" or "Take Photo" to provide a menu image
2. **Text Extraction**: The app automatically extracts text from the image using OCR
3. **Menu Analysis**: ChatGPT analyzes the text to verify it's a menu and extracts the top 5 dishes
4. **Image Generation**: Stable Diffusion (via Replicate) generates photorealistic images for each dish at 512x512 resolution
5. **View Results**: Browse the generated dishes with their descriptions and images

## Error Handling

The application includes comprehensive error handling for:
- Invalid file uploads
- OCR processing failures
- Non-menu images
- API rate limits
- Network connectivity issues

## Performance

- **OCR Processing**: Optimized for speed and accuracy
- **Image Generation**: Sequential processing with delays to avoid rate limits
- **UI Responsiveness**: Loading states and progressive image loading

## Security Features

- **API Key Protection**: OpenAI and Replicate API keys are stored securely on the backend
- **Input Validation**: File type and size validation
- **Error Sanitization**: User-friendly error messages without exposing internal details
- **CORS Configuration**: Proper cross-origin request handling

## Project Structure

```
AI-Powered_Food_Visualization/
├── src/
│   ├── pages/
│   │   └── Index.tsx          # Main application component
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   └── assets/                # Static assets
├── backend/
│   ├── app.py                 # Flask backend server
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Backend Docker image
│   └── README.md             # Backend setup instructions
├── Dockerfile.frontend        # Frontend Docker image
├── Dockerfile.frontend.dev    # Frontend Docker image (dev)
├── Dockerfile                 # Production frontend Docker image
├── docker-compose.yml         # Development Docker Compose file
├── docker-compose.prod.yml    # Production Docker Compose file
├── public/                   # Public assets
└── README.md                # This file
```

## Development

- Use `docker-compose -f docker-compose.prod.yml up --build` to start both frontend and backend in production mode
- Use `docker-compose -f docker-compose.prod.yml down` to stop all services

## API Endpoints

### Backend (Flask)
- `POST /api/analyze-menu` - Analyzes menu text and extracts dishes
- `POST /api/generate-images` - Generates images for dishes (Stable Diffusion via Replicate, 512x512)
- `GET /api/health` - Health check endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
