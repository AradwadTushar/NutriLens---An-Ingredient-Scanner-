import os
import cv2
import re
import numpy as np
import time
import base64
import json
import traceback
from dotenv import load_dotenv
import certifi

# Load environment variables before configuring any services
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))
load_dotenv()

# Configure reliable DNS for MongoDB SRV resolution
try:
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1']
except Exception:
    pass

from flask import Flask, request, jsonify, render_template, send_file
from exports import generate_pdf_report, generate_docx_report
from flask_cors import CORS
from flask_pymongo import PyMongo
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
try:
    from paddleocr import PaddleOCR
except ImportError:
    PaddleOCR = None
import openai
import google.generativeai as genai

# Configure AI Services
genai_api_key = os.getenv("GEMINI_API_KEY")
if genai_api_key:
    genai.configure(api_key=genai_api_key)
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "models/gemini-3.5-flash-lite")

# ✅ Initialize App and Configs
app = Flask(__name__)
CORS(app)

# MongoDB Setup
app.config['MONGO_URI'] = os.getenv("MONGO_URI")

app.secret_key = os.getenv("JWT_SECRET_KEY")
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")

# Mail Setup
app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT", 587))
app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
app.config['MAIL_USE_SSL'] = os.getenv("MAIL_USE_SSL", "False").lower() in ("true", "1", "yes")
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
mail = Mail(app)

jwt = JWTManager(app)

# Role & Quota Config
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "aradwadtushar72@gmail.com").strip().lower()

def get_user_quota(user_email):
    if not user_email or getattr(mongo, 'db', None) is None:
        return None, None
    users = mongo.db.users
    user = users.find_one({'email': {'$regex': f'^{re.escape(str(user_email).strip())}$', '$options': 'i'}})
    if not user:
        return None, None

    email_clean = user.get('email', '').strip().lower()
    is_admin = (email_clean == ADMIN_EMAIL or user.get('role') == 'admin')
    role = 'admin' if is_admin else user.get('role', 'user')
    scans_limit = -1 if role == 'admin' else user.get('scansLimit', 2)
    scans_used = user.get('scansUsed', 0)
    scans_remaining = -1 if role == 'admin' else max(0, scans_limit - scans_used)

    quota_info = {
        'role': role,
        'scansUsed': scans_used,
        'scansLimit': scans_limit,
        'scansRemaining': scans_remaining,
        'is_admin': is_admin
    }
    return user, quota_info
#print("MONGO URI RAW:", os.getenv("MONGO_URI"))
app.config['MONGO_TLS_CA_FILE'] = certifi.where()
mongo = PyMongo()

try:
    mongo.init_app(app)
    if mongo.cx:
        mongo.cx.server_info()
        print("[OK] Mongo Connected Successfully")
except Exception as e:
    print("[ERROR] Mongo Connection Failed (offline/network):", e)
openai.api_key = os.getenv("OPENAI_API_KEY")

#print("OPENAI:", bool(os.getenv("OPENAI_API_KEY")))
#print("MONGO:", bool(os.getenv("MONGO_URI")))

# Upload folder
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# OCR & AI Setup with Fail-Safe Cloud Fallback
ocr_model = None
if PaddleOCR is not None:
    try:
        ocr_model = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False)
        print("[OK] PaddleOCR initialized successfully")
    except Exception as e:
        print("[WARN] PaddleOCR initialization skipped or failed:", e)
else:
    print("[INFO] PaddleOCR not installed in environment; using high-speed Cloud Vision engine")

def warmup_ocr():
    if not ocr_model:
        return
    try:
        dummy = np.zeros((100, 100, 3), dtype=np.uint8)
        ocr_model.ocr(dummy, cls=True)
        print("[OK] OCR warmed up")
    except Exception as e:
        print("[WARN] OCR warmup (safe to ignore):", e)

warmup_ocr()

def extract_text_via_openai_vision(image_path):
    """Fallback OCR using OpenAI GPT-4o-mini Vision."""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return [], []
        client = openai.OpenAI(api_key=api_key)
        with open(image_path, 'rb') as f:
            b64_img = base64.b64encode(f.read()).decode('utf-8')

        ext = os.path.splitext(image_path)[1].lower()
        mime = 'image/png' if ext == '.png' else ('image/webp' if ext == '.webp' else 'image/jpeg')

        response = client.chat.completions.create(
            model='gpt-4o-mini',
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You are an optical character recognition (OCR) engine for food nutrition labels.\n"
                                "Examine this packaging image and extract:\n"
                                '1. "merged_text_lines": array of all text lines detected on the label.\n'
                                '2. "ingredients": array of individual clean ingredients (e.g. ["Sugar", "Palm Oil", "Wheat Flour"]).\n'
                                'Respond ONLY with valid json with keys "merged_text_lines" and "ingredients".'
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime};base64,{b64_img}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1500
        )
        raw_text = response.choices[0].message.content.strip()
        data = json.loads(raw_text)
        return data.get('merged_text_lines', []), data.get('ingredients', [])
    except Exception as e:
        print('[ERROR] OpenAI Vision OCR error:', e)
        return [], []

def extract_text_via_gemini_vision(image_path):
    """Fallback OCR using Gemini 2.5 Flash Vision, with cascade to OpenAI Vision if Gemini credits/quota are exhausted."""
    # 1. Attempt Gemini 2.5 Flash Vision
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(GEMINI_MODEL)
            from PIL import Image
            img = Image.open(image_path)

            prompt = (
                'You are an optical character recognition (OCR) engine for food nutrition labels.\n'
                'Examine this packaging image and extract:\n'
                '1. "merged_text_lines": array of all text lines detected on the label.\n'
                '2. "ingredients": array of individual clean ingredients (e.g. ["Sugar", "Palm Oil", "Wheat Flour"]).\n'
                'Respond ONLY with valid JSON with keys "merged_text_lines" and "ingredients".'
            )

            response = model.generate_content([prompt, img])
            raw_text = response.text.strip()
            if raw_text.startswith('```'):
                raw_text = re.sub(r'^```(?:json)?\n|\n```$', '', raw_text, flags=re.MULTILINE).strip()
            data = json.loads(raw_text)
            lines = data.get('merged_text_lines', [])
            ingredients = data.get('ingredients', [])
            if lines or ingredients:
                print('[OK] Gemini Vision OCR extracted successfully')
                return lines, ingredients
    except Exception as e:
        print('[WARN] Gemini Vision OCR unavailable or credits depleted (cascading to OpenAI Vision):', e)

    # 2. Seamlessly cascade to OpenAI Vision
    print('[INFO] Cascading to OpenAI GPT-4o-mini Vision OCR...')
    return extract_text_via_openai_vision(image_path)

# Health Check
@app.route('/')
def health():
    return "NutriLens Backend Running ✅"

# ------------------- AUTH ROUTES -------------------
@app.route('/register', methods=['POST'])
def userRegister():
    users = mongo.db.users
    data = request.json or {}

    email = data.get('email', '').strip().lower()
    company_name = data.get('companyName', '').strip()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    cpassword = data.get('cpassword', '')

    if not email or not password:
        return jsonify(message='Email and password are required'), 400

    if users.find_one({'email': {'$regex': f'^{re.escape(email)}$', '$options': 'i'}}):
        return jsonify(message='Email already exists'), 401
    if company_name and users.find_one({'companyName': company_name}):
        return jsonify(message='Company Name already exists'), 401
    if phone and users.find_one({'phone': phone}):
        return jsonify(message='Phone number already exists'), 401
    if password != cpassword:
        return jsonify(message='Password not matching!'), 401

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    token = create_access_token(identity=email)

    is_admin = (email == ADMIN_EMAIL)
    role = 'admin' if is_admin else 'user'
    scans_limit = -1 if is_admin else 2

    users.insert_one({
        'email': email,
        'companyName': company_name,
        'phone': phone,
        'password': hashed_pw,
        'role': role,
        'scansUsed': 0,
        'scansLimit': scans_limit,
        'tokens': [{'token': token}],
        'createdAt': time.time()
    })

    # Fail-safe welcome email (Rule 3.1: Fail-Safe Telemetry)
    if app.config.get('MAIL_USERNAME') and app.config.get('MAIL_PASSWORD'):
        try:
            msg = Message(
                "Welcome to NutriLens 🥗",
                sender=app.config['MAIL_USERNAME'],
                recipients=[email],
                body=f"Hi {company_name or 'there'},\nWelcome to NutriLens! 🎉")
            mail.send(msg)
        except Exception as e:
            print("[WARN] Failed to send welcome email (non-fatal):", e)

    return jsonify(
        token=token,
        role=role,
        scansUsed=0,
        scansLimit=scans_limit
    ), 201

@app.route('/login', methods=['POST'])
def userLogin():
    users = mongo.db.users
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = users.find_one({'email': {'$regex': f'^{re.escape(email)}$', '$options': 'i'}})

    if user and bcrypt.checkpw(password.encode(), user['password'].encode()):
        token = create_access_token(identity=user['email'])
        users.update_one({'_id': user['_id']}, {'$push': {'tokens': {'token': token}}})

        is_admin = (user.get('email', '').strip().lower() == ADMIN_EMAIL or user.get('role') == 'admin')
        role = 'admin' if is_admin else user.get('role', 'user')
        scans_limit = -1 if role == 'admin' else user.get('scansLimit', 2)
        scans_used = user.get('scansUsed', 0)

        return jsonify(
            token=token,
            role=role,
            scansUsed=scans_used,
            scansLimit=scans_limit,
            message='Login Successful'
        ), 201

    return jsonify(message='Invalid email/password'), 401

@app.route('/logout', methods=['POST'])
def userLogout():
    users = mongo.db.users
    auth_token = request.json.get('auth') if request.json else None
    user = users.find_one({'tokens.token': auth_token})

    if user:
        users.update_one({'_id': user['_id']}, {'$set': {'tokens': []}})
        return jsonify(message='Logout Successful'), 201

    return jsonify(message='Logout Failed'), 401

@app.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_profile():
    current_user_email = get_jwt_identity()
    user, quota_info = get_user_quota(current_user_email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'email': user.get('email'),
        'companyName': user.get('companyName', ''),
        'phone': user.get('phone', ''),
        'role': quota_info['role'],
        'scansUsed': quota_info['scansUsed'],
        'scansLimit': quota_info['scansLimit'],
        'scansRemaining': quota_info['scansRemaining']
    }), 200

@app.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    message = request.form.get('message', '')
    image_file = request.files.get('image')

    parts = []
    if message:
        parts.append(message)
    if image_file:
        image_data = image_file.read()
        mime_type = image_file.mimetype or 'image/jpeg'
        parts.append({
            "mime_type": mime_type,
            "data": base64.b64encode(image_data).decode('utf-8')
        })

    if not parts:
        return jsonify({'reply': 'No message or image provided.'}), 400

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return jsonify({'reply': 'AI service is temporarily unconfigured.'}), 500

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(parts)
        reply_text = getattr(response, 'text', '')
        if not reply_text and hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                reply_text = "".join(part.text for part in candidate.content.parts if hasattr(part, 'text'))
        return jsonify({'reply': reply_text or "No response generated."})
    except Exception as e:
        print("Gemini error:", e)
        err_msg = str(e)
        if "ResourceExhausted" in err_msg or "429" in err_msg:
            return jsonify({'reply': 'Nutrii AI companion is currently receiving high demand. Please try again in a few moments.'}), 429
        return jsonify({'reply': 'An error occurred while generating a response. Please try again.'}), 500

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







@app.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    current_user_email = get_jwt_identity()
    user, quota_info = get_user_quota(current_user_email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Enforce scan quota for non-admin users
    if not quota_info['is_admin'] and quota_info['scansLimit'] != -1:
        if quota_info['scansUsed'] >= quota_info['scansLimit']:
            return jsonify({
                'error': 'QUOTA_EXCEEDED',
                'message': 'Free scan limit reached (2 free scans used). Please contact the administrator or upgrade for unlimited scans.',
                'scansUsed': quota_info['scansUsed'],
                'scansLimit': quota_info['scansLimit'],
                'scansRemaining': 0
            }), 403

    if 'image' not in request.files:
        return jsonify({'error': 'No image file found'}), 400

    try:
        file = request.files['image']
        filename = secure_filename(file.filename)
        if not filename:
            return jsonify({'error': 'Invalid filename'}), 400
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(image_path)
        time.sleep(0.2)

        resize_image(image_path)
        preprocessed = preprocess_image(image_path)
        cv2.imwrite(os.path.join(app.config['UPLOAD_FOLDER'], "processed_" + filename), preprocessed)

        results = None
        if ocr_model is not None:
            try:
                raw_ocr = ocr_model.ocr(image_path, cls=True)
                results = raw_ocr[0] if raw_ocr else None
            except Exception as ocr_err:
                print("[WARN] PaddleOCR execution failed (RAM/lib error):", ocr_err)
                results = None

        if results:
            merged_text_lines = merge_nearby_boxes(results)
            ingredients, cleaned_text = extract_ingredients_from_text(results)
        else:
            # Automatic cloud fallback to Gemini 2.5 Flash Vision OCR
            print("[INFO] Running cloud Gemini 2.5 Flash Vision OCR fallback...")
            merged_text_lines, ingredients = extract_text_via_gemini_vision(image_path)
            cleaned_text = ' '.join(merged_text_lines)

        if not merged_text_lines and not ingredients:
            return jsonify({'error': 'No text detected in the image.'}), 200

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
    current_user_email = get_jwt_identity()
    user, quota_info = get_user_quota(current_user_email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Enforce scan quota for non-admin users
    if not quota_info['is_admin'] and quota_info['scansLimit'] != -1:
        if quota_info['scansUsed'] >= quota_info['scansLimit']:
            return jsonify({
                'error': 'QUOTA_EXCEEDED',
                'message': 'Free scan limit reached (2 free scans used). Please contact the administrator or upgrade for unlimited scans.',
                'scansUsed': quota_info['scansUsed'],
                'scansLimit': quota_info['scansLimit'],
                'scansRemaining': 0
            }), 403

    data = request.get_json() or {}

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

            # Increment scansUsed for non-admin users upon successful analysis
            if not quota_info['is_admin']:
                mongo.db.users.update_one({'_id': user['_id']}, {'$inc': {'scansUsed': 1}})

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


# ------------------- ADMIN ROUTES -------------------
def check_admin_access():
    current_user_email = get_jwt_identity()
    user, quota_info = get_user_quota(current_user_email)
    if not user or not quota_info['is_admin']:
        return None, (jsonify({'error': 'FORBIDDEN', 'message': 'Admin access required.'}), 403)
    return user, None

@app.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_get_users():
    _, err = check_admin_access()
    if err:
        return err

    users_cursor = mongo.db.users.find({}, {'password': 0, 'tokens': 0})
    user_list = []
    for u in users_cursor:
        u_email = u.get('email', '')
        u_is_admin = (u_email.strip().lower() == ADMIN_EMAIL or u.get('role') == 'admin')
        u_role = 'admin' if u_is_admin else u.get('role', 'user')
        u_limit = -1 if u_role == 'admin' else u.get('scansLimit', 2)
        u_used = u.get('scansUsed', 0)
        user_list.append({
            'id': str(u.get('_id')),
            'email': u_email,
            'companyName': u.get('companyName', ''),
            'phone': u.get('phone', ''),
            'role': u_role,
            'scansUsed': u_used,
            'scansLimit': u_limit,
            'scansRemaining': -1 if u_role == 'admin' else max(0, u_limit - u_used),
            'createdAt': u.get('createdAt')
        })

    return jsonify({'users': user_list, 'count': len(user_list)}), 200

@app.route('/admin/users/<email>/reset-quota', methods=['POST'])
@jwt_required()
def admin_reset_user_quota(email):
    _, err = check_admin_access()
    if err:
        return err

    data = request.get_json(silent=True) or {}
    new_limit = data.get('scansLimit')
    reset_used = data.get('resetUsed', True)

    update_fields = {}
    if reset_used:
        update_fields['scansUsed'] = 0
    if new_limit is not None:
        try:
            update_fields['scansLimit'] = int(new_limit)
        except (ValueError, TypeError):
            return jsonify({'error': 'scansLimit must be an integer'}), 400

    if not update_fields:
        update_fields['scansUsed'] = 0

    target_email = email.strip()
    result = mongo.db.users.update_one(
        {'email': {'$regex': f'^{re.escape(target_email)}$', '$options': 'i'}},
        {'$set': update_fields}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'message': f'Quota updated successfully for {target_email}',
        'updated': update_fields
    }), 200


# ------------------- EXPORT ROUTES -------------------
@app.route('/export/pdf', methods=['POST'])
@jwt_required()
def export_pdf():
    data = request.get_json(silent=True) or {}
    try:
        pdf_buffer = generate_pdf_report(data)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='NutriLens_Food_Dossier.pdf'
        )
    except Exception as e:
        print("[ERROR] PDF export failed:", e)
        return jsonify({'error': 'Failed to generate PDF', 'details': str(e)}), 500

@app.route('/export/docx', methods=['POST'])
@jwt_required()
def export_docx():
    data = request.get_json(silent=True) or {}
    try:
        docx_buffer = generate_docx_report(data)
        return send_file(
            docx_buffer,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name='NutriLens_Food_Dossier.docx'
        )
    except Exception as e:
        print("[ERROR] DOCX export failed:", e)
        return jsonify({'error': 'Failed to generate DOCX', 'details': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)

