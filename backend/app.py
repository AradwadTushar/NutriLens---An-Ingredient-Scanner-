from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_pymongo import PyMongo
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
import traceback
import os, cv2, re, numpy as np, time
from paddleocr import PaddleOCR
import openai
#from openai import OpenAI
import os
from dotenv import load_dotenv
import certifi
import google.generativeai as genai
import json
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


load_dotenv()

# ✅ Initialize App and Configs
app = Flask(__name__)
CORS(app)

# MongoDB Setup
app.config['MONGO_URI'] = os.getenv("MONGO_URI")

app.secret_key = os.getenv("JWT_SECRET_KEY")
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")

app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
jwt = JWTManager(app)
#print("MONGO URI RAW:", os.getenv("MONGO_URI"))
app.config['MONGO_TLS_CA_FILE'] = certifi.where()
mongo = PyMongo(app) 

try:
    mongo.cx.server_info()
    print("✅ Mongo Connected Successfully")
except Exception as e:
    print("❌ Mongo Connection Failed:", e)
openai.api_key = os.getenv("OPENAI_API_KEY")

#print("OPENAI:", bool(os.getenv("OPENAI_API_KEY")))
#print("MONGO:", bool(os.getenv("MONGO_URI")))

# Upload folder
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# OCR & AI Setup
# Initialize PaddleOCR
ocr_model = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False)

# ✅ Warmup OCR to prevent first-request failure
def warmup_ocr():
    try:
        dummy = np.zeros((100, 100, 3), dtype=np.uint8)
        ocr_model.ocr(dummy, cls=True)
        print("✅ OCR warmed up")
    except Exception as e:
        print("⚠️ OCR warmup (safe to ignore):", e)

warmup_ocr()

# Health Check
@app.route('/')

#import google.generativeai as genai

# Health Check
@app.route('/')
def health():
    return "NutriLens Backend Running ✅"

# ------------------- AUTH ROUTES -------------------
@app.route('/register', methods=['POST'])
def userRegister():
    users = mongo.db.users
    data = request.json

    if users.find_one({'email': data['email']}):
        return jsonify(message='Email already exists'), 401
    if users.find_one({'companyName': data['companyName']}):
        return jsonify(message='Company Name already exists'), 401
    if users.find_one({'phone': data['phone']}):
        return jsonify(message='Phone number already exists'), 401
    if data['password'] != data['cpassword']:
        return jsonify(message='Password not matching!'), 401

    hashed_pw = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
    token = create_access_token(identity=data['email'])

    users.insert_one({
        'email': data['email'],
        'companyName': data['companyName'],
        'phone': data['phone'],
        'password': hashed_pw,
        'tokens': [{'token': token}]
    })

    msg = Message("Welcome to NutriLens 🥗", sender=app.config['MAIL_USERNAME'], recipients=[data['email']], body=f"Hi {data['companyName']},\nWelcome to NutriLens! 🎉")
    mail.send(msg)

    return jsonify(token=token), 201

@app.route('/login', methods=['POST'])
def userLogin():
    users = mongo.db.users
    data = request.json
    user = users.find_one({'email': data['email']})

    if user and bcrypt.checkpw(data['password'].encode(), user['password'].encode()):
        token = create_access_token(identity=data['email'])
        users.update_one({'_id': user['_id']}, {'$push': {'tokens': {'token': token}}})
        return jsonify(token=token), 201

    return jsonify(message='Invalid email/password'), 401

@app.route('/logout', methods=['POST'])
def userLogout():
    users = mongo.db.users
    user = users.find_one({'tokens.token': request.json['auth']})

    if user:
        users.update_one({'_id': user['_id']}, {'$set': {'tokens': []}})
        return jsonify(message='Logout Successful'), 201

    return jsonify(message='Logout Failed'), 401


@app.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    message = request.form.get('message', '')
    image_file = request.files.get('image')

    parts = []
    if message:
        parts.append(message)
    if image_file:
        import base64
        image_data = image_file.read()
        parts.append({
            "mime_type": image_file.mimetype,
            "data": base64.b64encode(image_data).decode('utf-8')
        })

    if not parts:
        return jsonify({'reply': 'No message provided.'}), 400

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = model.generate_content(parts)
        return jsonify({'reply': response.text})
    except Exception as e:
        print("Gemini error:", e)
        return jsonify({'reply': f'Error: {str(e)}'}), 500

# ------------------- IMAGE & ANALYSIS ROUTES -------------------

# Image Preprocessing
def preprocess_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"❌ Image loading failed in preprocess_image: {image_path}")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(
        blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY_INV, 11, 2
    )
    return thresh


# Resize Image if too small
def resize_image(image_path, width=1000):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"❌ Image loading failed in resize_image: {image_path}")

    h, w = img.shape[:2]
    if w < width:
        ratio = width / float(w)
        dim = (width, int(h * ratio))
        resized = cv2.resize(img, dim, interpolation=cv2.INTER_LINEAR)
        cv2.imwrite(image_path, resized)


# Merge Nearby Text Boxes
def merge_nearby_boxes(results, max_dist=50):
    merged = []
    temp = []

    for line in sorted(results, key=lambda r: r[0][0][1]):
        bbox = line[0]
        text = line[1][0]
        conf = line[1][1]

        x_center = int((bbox[0][0] + bbox[2][0]) / 2)
        y_center = int((bbox[0][1] + bbox[2][1]) / 2)

        if not temp:
            temp.append((bbox, text, conf, x_center, y_center))
            continue

        _, _, _, prev_x, prev_y = temp[-1]
        if abs(y_center - prev_y) < max_dist:
            temp.append((bbox, text, conf, x_center, y_center))
        else:
            merged.append(" ".join([t[1] for t in temp]))
            temp = [(bbox, text, conf, x_center, y_center)]

    if temp:
        merged.append(" ".join([t[1] for t in temp]))

    return merged

# Step-by-Step Cleanup Functions
def clean_ocr_text(raw_text):
    text = raw_text.lower()
    text = re.sub(r'[\n\r]', ' ', text)  # <- ✅ FIXED
    text = re.sub(r'[^a-z0-9,%().\- ]', '', text)
    return text


#import difflib

#def extract_ingredient_section(text):
#    words = text.lower().split()
    
    # Search for something similar to 'ingredients'
#    for idx, word in enumerate(words):
#        if difflib.SequenceMatcher(None, word, 'ingredients').ratio() > 0.75:
#            section = ' '.join(words[idx + 1:])

            # Cut off at known section titles
#            for cut_word in ['nutritional information', 'nutrition facts', 'per 100g']:
 #               if cut_word in section:
 #                   section = section.split(cut_word)[0]
#                    break

#            return section.strip()
    
#    return None


def extract_ingredient_section(text):
    match = re.search(r'(ingredients|insredients|ingredient list|ingredlents)(.*)', text, re.IGNORECASE)
    if match:
        section = match.group(2)

        # Try to cut off at known section titles
        for word in ['nutritional information', 'nutrition facts', 'per 100g']:
            if word in section:
                section = section.split(word)[0]
                break

        return section
    return None



def split_ingredients(raw_ingredients):
    ingredients = re.split(r'[;,]', raw_ingredients)
    return [i.strip() for i in ingredients if i.strip()]

def filter_keywords(ingredient):
    blacklist = ['may contain', 'traces of', 'added flavor', 'flavouring']
    for word in blacklist:
        if word in ingredient:
            return None
    return ingredient


def apply_filtering(ingredients):
    return list(filter(None, [filter_keywords(i) for i in ingredients]))

def format_ingredient(ing):
    ing = ing.strip().lower()
    return ing.title()

def format_ingredients_list(ingredients):
    return [format_ingredient(i) for i in ingredients]

# Final Cleanup Pipeline
def extract_ingredients_from_text(results):
    try:
        all_text = " ".join([item[1][0] for item in results])
        print("🔍 Raw OCR text:", all_text)

        cleaned_text = clean_ocr_text(all_text)
        print("🧼 Cleaned OCR text:", cleaned_text)

        section = extract_ingredient_section(cleaned_text)

        if not section or not isinstance(section, str):
            print("❌ Section is invalid or not a string:", section)
            return [], cleaned_text

        try:
            section = re.sub(r'[^a-zA-Z0-9,() ]+', '', section)
        except Exception as e:
            print("❌ re.sub failed:", e)
            return [], cleaned_text

        print("🔎 Cleaned section after re.sub:", section)

        split_list = split_ingredients(section)
        filtered = apply_filtering(split_list)
        ingredients = format_ingredients_list(filtered)

        print("✅ Extracted Ingredients:", ingredients)
        return ingredients, cleaned_text

    except Exception as e:
        print("❌ Error in extract_ingredients_from_text:", e)
        return [], ""







#@app.route('/')
#def index():
    #return render_template('index.html')

from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

@app.route('/upload', methods=['POST'])
@jwt_required()                          # ← add this line
def upload_image():
    current_user = get_jwt_identity()
    if 'image' not in request.files:
        return jsonify({'error': 'No image file found'}), 400

    try:
        file = request.files['image']
        from werkzeug.utils import secure_filename   # add this at the top of the file

        filename = secure_filename(file.filename)
        if not filename:
            return jsonify({'error': 'Invalid filename'}), 400
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(image_path)
        time.sleep(0.2)

        resize_image(image_path)
        preprocessed = preprocess_image(image_path)
        cv2.imwrite(os.path.join(app.config['UPLOAD_FOLDER'], "processed_" + filename), preprocessed)

        results = ocr_model.ocr(image_path, cls=True)[0]
        if not results:
            return jsonify({'error': 'No text detected in the image.'}), 200

        merged_text_lines = merge_nearby_boxes(results)
        ingredients, cleaned_text = extract_ingredients_from_text(results)

        return jsonify({
            "image_path": image_path.replace("\\", "/"),
            "merged_text_lines": merged_text_lines,
            "ingredients": ingredients if ingredients else "No ingredients found.",
            "cleaned_text": cleaned_text
        })

    except Exception as e:
        print(f"❌ Error during upload: {e}")
        return jsonify({'error': 'Failed to process the image'}), 500


@app.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_ingredients():
    import json

    current_user = get_jwt_identity()
    data = request.get_json()

    nutrition_lines = data.get('merged_text_lines', [])
    ingredients = data.get('ingredients', [])
    preferences = data.get('preferences', {})
    cleaned_text = data.get('cleaned_text', '')

    print("📤 Sending to AI...")
    print("📋 Ingredients:", ingredients)
    print("📜 Merged lines:", nutrition_lines)
    print("🧼 Cleaned Text:", repr(cleaned_text))
    print("🙋 Preferences:", preferences)

    # 🔄 Fix empty cleaned_text
    if not cleaned_text or not isinstance(cleaned_text, str) or cleaned_text.strip() == "":
        print("⚠️ cleaned_text empty → rebuilding from merged_text_lines")
        cleaned_text = " ".join(nutrition_lines).lower()

    # 🚨 Fallback instead of returning early
    if not nutrition_lines or len(nutrition_lines) == 0:
        print("⚠️ No merged_text_lines → using cleaned_text fallback")

        if cleaned_text:
            nutrition_lines = [cleaned_text]
        else:
            return jsonify({
                "ingredients": [],
                "nutrition": {},
                "summary": {
                    "safe": "",
                    "warning": "",
                    "avoid": "No readable data found in image"
                },
                "verdict": "Caution"
            })

    # 🔹 Clean ingredient handling
    if not ingredients:
        ingredients_info = "No clear ingredient list found. Infer from OCR text if possible."
    elif isinstance(ingredients, list):
        ingredients_info = ", ".join(ingredients)
    else:
        ingredients_info = str(ingredients)

    # 🔹 Preferences
    prefs = preferences
    allergies = ", ".join(prefs.get('allergies', [])) if isinstance(prefs.get('allergies'), list) else prefs.get('allergies', 'None')
    warnings = ", ".join(prefs.get('warnings', [])) if isinstance(prefs.get('warnings'), list) else prefs.get('warnings', 'None')

    diet = prefs.get('diet', 'None')
    healthGoal = prefs.get('healthGoal', 'None')
    region = prefs.get('region', 'None')
    sustainability = prefs.get('sustainability', 'None')

    # 🔹 Limit text size (important)
    cleaned_text = cleaned_text[:3000]

    # 🔥 FINAL PROMPT (escaped JSON)
    prompt = f"""
You are a food analysis assistant.

Analyze OCR text and return structured JSON.

--- OCR DATA ---
Merged Text:
{chr(10).join(nutrition_lines)}

Ingredients:
{ingredients_info}

Cleaned Text:
{cleaned_text}

User Preferences:
Allergies: {allergies}
Diet: {diet}
Health Goals: {healthGoal}
Warnings: {warnings}
Region: {region}
Sustainability: {sustainability}

---

Return ONLY JSON:

{{
  "nutrition": {{
    "calories": "",
    "protein": "",
    "carbs": "",
    "sugar": "",
    "fat": "",
    "sodium": "",
    "fiber": "",
    "calcium": "",
    "magnesium": "",
    "potassium": ""
  }},
  "ingredients": [
    {{
      "name": "",
      "status": "Good | Moderate | Risky",
      "description": ""
    }}
  ],
  "summary": {{
    "safe": "",
    "warning": "",
    "avoid": ""
  }},
  "verdict": "Healthy | Caution | Not recommended"
}}

Rules:
- If ingredients missing → return []
- If nutrition missing → return ""
- NO markdown
- NO extra text
"""

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You analyze food labels and return JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4
        )

        ai_reply = response.choices[0].message.content.strip()

        print("🧠 RAW AI:", ai_reply)

        # 🔧 Remove markdown if AI adds it
        if ai_reply.startswith("```"):
            ai_reply = ai_reply.split("```")[1]

        try:
            parsed = json.loads(ai_reply)
            return jsonify(parsed)

        except Exception as e:
            print("⚠️ JSON parse failed:", e)
            return jsonify({
                "ingredients": [],
                "nutrition": {},
                "summary": {
                    "safe": "",
                    "warning": "",
                    "avoid": "AI response could not be parsed"
                },
                "verdict": "Caution"
            })

    except Exception as e:
        print("❌ AI error:", e)
        return jsonify({
            "ingredients": [],
            "nutrition": {},
            "summary": {
                "safe": "",
                "warning": "",
                "avoid": "AI processing failed"
            },
            "verdict": "Caution"
        })


if __name__ == '__main__':
    app.run(debug=True)

