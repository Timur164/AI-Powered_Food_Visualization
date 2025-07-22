from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
import time
import sys
import replicate

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:8080",
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://ai-powered-food-visualization-frontend.onrender.com"
], supports_credentials=True)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN')
if REPLICATE_API_TOKEN:
    replicate_client = replicate.Client(api_token=REPLICATE_API_TOKEN)
else:
    replicate_client = None

@app.after_request
def after_request(response):
    # Flask-CORS handles CORS headers automatically
    return response

@app.route('/api/analyze-menu', methods=['POST'])
def analyze_menu():
    try:
        data = request.get_json()
        menu_text = data.get('menuText', '')
        
        if not menu_text:
            return jsonify({'error': 'Menu text is required'}), 400
        
        # Call OpenAI to analyze menu and extract dishes
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that extracts dish names and short, appetizing descriptions from restaurant menus. If the provided text is not a food menu, reply with ONLY the word 'ERROR'. If it is a menu, choose the top 5 dishes by your own opinion (based on popularity, uniqueness, or taste appeal) and reply with a JSON array of 5 objects, each with 'name' (dish name) and 'description' (a short, appetizing description of the dish). Reply ONLY with the JSON array or 'ERROR'. Example: [{\"name\":\"Tiramisu\",\"description\":\"Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream\"}, ...]"
                },
                {
                    "role": "user",
                    "content": menu_text
                }
            ],
            temperature=0.2
        )
        
        content = response.choices[0].message.content.strip()
        
        if content == "ERROR":
            return jsonify({'error': 'The uploaded image does not appear to be a food menu. Please try again.'}), 400
        
        # Extract JSON from response
        try:
            # Remove code blocks if present
            if '```' in content:
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
                content = content.strip()
            
            dishes = json.loads(content)
            
            if not isinstance(dishes, list) or len(dishes) == 0:
                return jsonify({'error': 'Failed to extract dishes from menu. Please try another image.'}), 400
            
            return jsonify({'dishes': dishes})
            
        except json.JSONDecodeError:
            return jsonify({'error': 'Failed to parse menu analysis. Please try again.'}), 400
            
    except Exception as e:
        print(f"Error in analyze_menu: {str(e)}", file=sys.stderr)
        import traceback; traceback.print_exc()
        return jsonify({'error': 'An error occurred while analyzing the menu. Please try again.'}), 500

@app.route('/api/generate-images', methods=['POST'])
def generate_images():
    try:
        data = request.get_json()
        dishes = data.get('dishes', [])
        
        if not dishes or not isinstance(dishes, list):
            return jsonify({'error': 'Dishes array is required'}), 400
        
        images = []
        
        if not replicate_client:
            return jsonify({'error': 'Replicate API token not set'}), 500

        for i, dish in enumerate(dishes[:5]):  # Limit to 5 dishes
            try:
                # Using SDXL 1.0 for ultra-high quality 1024x1024 food photography
                prompt = f"A photorealistic, beautifully plated dish on a white ceramic plate: {dish['name']}. {dish['description']} Professional food photography, restaurant menu style, ultra high detail, vibrant colors, no text, no watermark, no people, the dish is properly plated on a clean white plate, 4k, studio lighting, shallow depth of field, mouthwatering, delicious looking, food photography, culinary art, masterpiece, award-winning photography, elegant plating."
                input = {
                    "prompt": prompt,
                    "width": 1024,
                    "height": 1024,
                    "num_inference_steps": 25,
                    "guidance_scale": 7.5,
                    "scheduler": "K_EULER"
                }
                output = replicate_client.run(
                    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                    input=input
                )
                # output is a list of URLs
                images.append(output[0])
                if i < len(dishes[:5]) - 1:
                    time.sleep(1)
            except Exception as e:
                print(f"Error generating image for {dish['name']}: {str(e)}", file=sys.stderr)
                images.append(None)
        return jsonify({'images': images})
    except Exception as e:
        print(f"Error in generate_images: {str(e)}", file=sys.stderr)
        import traceback; traceback.print_exc()
        return jsonify({'error': 'An error occurred while generating images. Please try again.'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'port': os.getenv('PORT', '5000')})

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Food Visualization Backend is running!',
        'port': os.getenv('PORT', '5000'),
        'timestamp': time.time()
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    print(f"Starting Flask app on port {port}", file=sys.stderr)
    print(f"Debug mode: {debug_mode}", file=sys.stderr)
    app.run(debug=debug_mode, host='0.0.0.0', port=port) 