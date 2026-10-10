from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

# Configure static folder to point to the frontend directory
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Load the model and encoder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'model.pkl')
ENCODER_PATH = os.path.join(BASE_DIR, 'models', 'city_encoder.pkl')

model = None
le = None

try:
    model = joblib.load(MODEL_PATH)
    le = joblib.load(ENCODER_PATH)
    print("Model and Encoder loaded successfully.")
except Exception as e:
    print(f"Error loading model or encoder: {e}")

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/cities', methods=['GET'])
def get_cities():
    if le:
        return jsonify({"cities": le.classes_.tolist()})
    return jsonify({"cities": []}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        area = float(data.get('area'))
        bhk = int(data.get('bhk'))
        city = data.get('city')

        if not all([area, bhk, city]):
            return jsonify({"error": "Missing required fields"}), 400

        # Encode city
        try:
            city_encoded = le.transform([city])[0]
        except ValueError:
            return jsonify({"error": f"City '{city}' not recognized"}), 400

        # Prepare input for model
        # Features: ['Area', 'No. of Bedrooms', 'City']
        features = np.array([[area, bhk, city_encoded]])
        prediction = model.predict(features)[0]

        return jsonify({
            "predicted_price": round(prediction, 2),
            "currency": "INR",
            "message": f"Estimated price for {bhk} BHK in {city} with {area} sqft is ₹{round(prediction/100000, 2)} Lakhs"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
