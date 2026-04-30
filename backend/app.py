from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_pymongo import PyMongo
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from flask_mail import Mail, Message
import traceback
import os, cv2, re, numpy as np, time
from paddleocr import PaddleOCR
import openai
#from openai import OpenAI

# ✅ Initialize App and Configs
app = Flask(__name__)
CORS(app)

# MongoDB Setup
app.config['MONGO_URI'] = ''
mongo = PyMongo(app)

# Auth Secrets
app.secret_key = 'secret key'
app.config['JWT_SECRET_KEY'] = 'this-is-secret-key'
jwt_manager = JWTManager(app)

# Email Config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'nutrilensorg@gmail.com'
app.config['MAIL_PASSWORD'] = 'olpp cnzu qijc lqve'
mail = Mail(app)

# Upload folder
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# OCR & AI Setup
# Initialize PaddleOCR
ocr_model = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False)
openai.api_key = ""
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

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file found'}), 400

    try:
        file = request.files['image']
        filename = file.filename
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
def analyze_ingredients():
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

    if not cleaned_text or not isinstance(cleaned_text, str) or cleaned_text.strip() == "":
        print("⚠️ cleaned_text was empty, rebuilding from merged_text_lines")
        cleaned_text = " ".join(nutrition_lines).lower()

    if not isinstance(nutrition_lines, list) or len(nutrition_lines) == 0:
        return jsonify({'message': '⚠️ No nutritional information found to analyze.'})

    # 🔄 Fallback if ingredients are missing or just a string
    if isinstance(ingredients, str) or not ingredients:
        ingredients_info = cleaned_text.strip()
    elif isinstance(ingredients, list):
        ingredients_info = ", ".join(ingredients)
    else:
        ingredients_info = "⚠️ Ingredients were not detected from the label."

    # ✅ Safely handle all preferences
    prefs = preferences
    allergies = ", ".join(prefs.get('allergies', [])) if isinstance(prefs.get('allergies'), list) else prefs.get('allergies', 'None')
    warnings = ", ".join(prefs.get('warnings', [])) if isinstance(prefs.get('warnings'), list) else prefs.get('warnings', 'None')

    diet = prefs.get('diet', 'None')
    healthGoal = prefs.get('healthGoal', 'None')
    region = prefs.get('region', 'None')
    sustainability = prefs.get('sustainability', 'None')

    prompt = f"""
You are a helpful food analysis assistant.

Here is some OCR scanned nutrition and ingredient information from a food label.

Use the following information to extract key nutritional values (per 100g/ml), ingredients, and assess the food based on user preferences (like keto, diabetes, allergies).

If any nutrition data (like potassium, calcium, magnesium) is missing in `merged_text_lines`, look for it in `cleaned_text`. Use both if needed to extract all important values.

---

🧾 Merged Text:
{chr(10).join(nutrition_lines)}

🧂 Ingredients:
{ingredients_info}

📋 User Preferences:
- Allergies: {allergies or 'None'}
- Diet: {diet}
- Health Goals: {healthGoal}
- Ingredient Warnings: {warnings or 'None'}
- Region Specific: {region}
- Sustainability: {sustainability}

🧼 Cleaned OCR Text (Backup Reference):
{cleaned_text}

Make sure to extract potassium, calcium, magnesium, and sodium if they are anywhere in the text.

🧠 Your Task:
1. If data is available, summarize key nutritional facts (✅ include protein, carbs, sugars, fat, sodium, and any others like calcium, magnesium, potassium).
2. If ingredients are present, assess them based on the user's preferences (e.g. allergies, keto, diabetes).
3. Clearly mention if any important information is missing (like fiber, calories, ingredient list).
4. Use `cleaned_text` to complete missing information if `merged_text_lines` seems noisy.
5. Provide a helpful health assessment — is it healthy or not? Who should avoid it?
6. Point out anything concerning based on the user's preferences.
7. Say whether it's okay for:
   - ✅ Diabetics
   - ✅ Heart patients
   - ✅ Weight loss diets
8. End with a simple overall verdict:
   - ✅ Healthy
   - ⚠️ Caution
   - ❌ Not recommended

🗒️ Respond in short, clear bullet points.
"""

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful food analysis assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        print("🧠 Raw AI Full Response:", response)
        ai_reply = response.choices[0].message.content
        print("💡 Final Extracted AI Reply:", ai_reply)

        return jsonify({'message': ai_reply})

    except Exception as e:
        print(f"❌ AI error: {e}")
        return jsonify({'message': '⚠️ Failed to analyze with OpenAI.', 'error': str(e)})



if __name__ == '__main__':
    app.run(debug=True)
