from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import requests
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GEMINI_API_KEY')
if not GOOGLE_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=GOOGLE_API_KEY)

def get_doctors_data():
    """Fetch doctor data from the internal Node.js API."""
    doctors_info = ""
    try:
        # Get doctor data from the internal Node.js API
        response = requests.get('https://curevirtual-2-production-ee33.up.railway.app/api/internal/doctors', timeout=5)
        if response.status_code == 200:
            doctors = response.json()
            print(f"Fetched {len(doctors)} doctors from database")
            if doctors:
                doctors_info = "Here is the current list of available doctors and their specialties:\n"
                for doc in doctors:
                    doctors_info += f"- Dr. {doc['name']} ({doc['specialization']}): Available {doc['availability']}\n"
            else:
                doctors_info = "Currently, no specific doctor schedules are listed in the database."
        else:
            print(f"Error fetching doctors: Status {response.status_code}")
            doctors_info = "Note: Could not retrieve live doctor schedules at this moment."
    except Exception as e:
        print(f"Exception fetching doctors: {str(e)}")
        doctors_info = "Note: Doctor schedule service is currently unavailable."
    
    print(f"Doctor Info being passed to AI: {doctors_info}")
    return doctors_info

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')

        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        # Fetch live doctor data for context
        doctors_context = get_doctors_data()

        # Create the model
        model = genai.GenerativeModel('gemini-flash-latest')

        # specific prompt for medical chatbot
        prompt = f"""
        You are a highly experienced and compassionate AI Medical Assistant for "CureVirtual". 
        Your goal is to provide preliminary health guidance and connect patients with the right specialists.

        Context:
        {doctors_context}

        User Query: "{user_message}"

        Instructions:
        1.  **Analyze Symptoms**: Carefully evaluate the mentioned symptoms if any.
        2.  **Specialist & Availability**: If the user asks about doctors or availability, use the provided context to recommend specific doctors, mentioning their specialization and timings.
        3.  **Concise Answer**: Provide a relevant and short answer in a single decent paragraph. Avoid long lists unless necessary.
        4.  **Emergency Check**: If the symptoms suggest a life-threatening emergency (e.g., chest pain, severe difficulty breathing), set "isEmergency" to true and provide IMMEDIATE instructions to call emergency services.
        5.  **Tone**: Professional, clear, and reassuring.

        Return ONLY a JSON object (no markdown) with this format:
        {{
            "specialty": "string (the recommended field)",
            "reply": "string (your concise, paragraph-style response)",
            "isEmergency": boolean
        }}
        """

        response = model.generate_content(prompt)
        response_text = response.text
        print(f"AI Response: {response_text}") # Debug log

        # specialized cleanup for Gemini's markdown code block response
        clean_text = response_text.replace('```json', '').replace('```', '').strip()
        
        try:
             json_response = json.loads(clean_text)
             return jsonify(json_response)
        except json.JSONDecodeError:
             # Fallback if AI doesn't return valid JSON
             return jsonify({
                 "specialty": "General Physician",
                 "reply": clean_text,
                 "isEmergency": False
             })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'python-chatbot-backend'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
