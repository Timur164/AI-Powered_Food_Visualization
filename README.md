# AI-Powered Food Visualization

A modern web application that transforms restaurant menus into visual experiences using AI. Upload a photo of any menu, and the app will automatically extract text, identify the top dishes, and generate photorealistic images of each dish.

<img width="942" height="787" alt="image" src="https://github.com/user-attachments/assets/a3f4c0f6-f107-4b2d-89f3-827cfc69f742" />



## Features

- **Menu Text Extraction (OCR)**: Uses [Tesseract.js](https://github.com/naptha/tesseract.js) for client-side image text recognition from uploaded menu images
- **Smart Menu Analysis**: Leverages ChatGPT to identify and describe the top 5 most appealing dishes
- **AI Image Generation**: Creates photorealistic food images using DALL·E
- **Dual Input Methods**: Support for both image upload and direct camera capture
- **Real-time Processing**: Shows loading states and progress for each step
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Error Handling**: Comprehensive error states for OCR, API calls, and image generation
- **Example Mode**: Built-in example viewer with curated dishes and images

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Shadcn/ui
- **Styling**: Tailwind CSS
- **OCR (Image Text Recognition)**: [Tesseract.js](https://github.com/naptha/tesseract.js)
- **AI Integration**: OpenAI (GPT-3.5 + DALL·E)
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd AI-Powered_Food_Visualization
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or your configured port).

## Usage

1. **Start Creating**:
   - Click "Start Creating" button
   - Choose to either upload an image or take a photo
   - Select or capture a menu image

2. **Automatic Processing**:
   - The app will automatically extract text from the image using Tesseract.js (OCR)
   - ChatGPT will analyze the menu and select top 5 dishes
   - DALL·E will generate photorealistic images for each dish

3. **View Results**:
   - See the recommended dishes with their descriptions
   - View the AI-generated images for each dish
   - Loading states and error messages will guide you through the process

4. **Example Mode**:
   - Click "View Examples" to see sample dishes and images
   - Explore the app's capabilities with curated content

## Error Handling

The application handles various error cases:
- Invalid image uploads
- OCR text extraction failures (Tesseract.js)
- Non-menu image detection
- API rate limits
- Image generation failures
- Network connectivity issues

## Performance Considerations

- Optimized DALL·E API calls to handle rate limits
- Efficient image processing and display
- Responsive UI with loading states
- Parallel processing where possible

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT and DALL·E APIs
- [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR capabilities
- Shadcn/ui for beautiful UI components
- All other open-source contributors
