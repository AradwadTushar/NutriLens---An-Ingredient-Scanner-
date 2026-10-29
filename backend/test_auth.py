import os
import traceback
from dotenv import load_dotenv
import certifi
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from flask_mail import Mail, Message

load_dotenv()

app = Flask(__name__)
CORS(app)

# Mongo Configuration
app.config['MONGO_URI'] = os.getenv("MONGO_URI")
app.config['MONGO_TLS_CA_FILE'] = certifi.where()
mongo = PyMongo(app)

app.secret_key = os.getenv("JWT_SECRET_KEY", "fallback-secret")
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "fallback-secret")
jwt_manager = JWTManager(app)

# Mail Configuration
app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT", 587))
app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")

mail = Mail(app)

@app.route('/')
def home():
    return "NutriLens Auth Test Running ✅"

@app.route('/register', methods=['POST'])
def userRegister():
    allusers = mongo.db.users
    data = request.json or {}

    email = data.get('email', '').strip().lower()
    company_name = data.get('companyName', '').strip()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    cpassword = data.get('cpassword', '')

    if not email or not password:
        return jsonify(message='Email and password are required'), 400

    if allusers.find_one({'email': email}):
        return jsonify(message='Email already exists'), 401
    if company_name and allusers.find_one({'companyName': company_name}):
        return jsonify(message='Company Name already exists'), 401
    if phone and allusers.find_one({'phone': phone}):
        return jsonify(message='Phone number already exists'), 401
    if password != cpassword:
        return jsonify(message='Password not matching!'), 401

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    access_token = create_access_token(identity=email)

    allusers.insert_one({
        'email': email,
        'companyName': company_name,
        'phone': phone,
        'password': hashed_pw,
        'tokens': [{'token': access_token}]
    })

    # Fail-safe welcome email
    if app.config.get('MAIL_USERNAME') and app.config.get('MAIL_PASSWORD'):
        try:
            msg = Message(
                subject="Welcome to NutriLens 🥗",
                sender=app.config['MAIL_USERNAME'],
                recipients=[email],
                body=f"Hi {company_name or 'there'},\n\nWelcome to NutriLens, your Health Buddy! 🎉\n\nYour account is now active.\n\nStay Healthy,\nNutriLens Team"
            )
            mail.send(msg)
        except Exception as e:
            print("⚠️ Failed to send welcome email (non-fatal):", e)

    return jsonify(token=access_token), 201


@app.route('/login', methods=['POST'])
def userLogin():
    allusers = mongo.db.users
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = allusers.find_one({'email': email})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        access_token = create_access_token(identity=email)
        allusers.update_one(
            {'_id': user['_id']},
            {'$push': {'tokens': {'token': str(access_token)}}}
        )
        return jsonify(token=str(access_token)), 201

    return jsonify(message='Invalid email/password'), 401


@app.route('/logout', methods=['POST'])
def userLogout():
    allusers = mongo.db.users
    auth_token = request.json.get('auth') if request.json else None
    user = allusers.find_one({'tokens.token': auth_token})

    if user:
        allusers.update_one(
            {'_id': user['_id']},
            {'$set': {'tokens': []}}
        )
        return jsonify(message='Logout Successful'), 201

    return jsonify(message='Logout Failed'), 401


# Global error handler
@app.errorhandler(Exception)
def handle_exception(e):
    print("🔥 Backend Error:")
    traceback.print_exc()
    return jsonify(message="Internal Server Error 💥"), 500


if __name__ == '__main__':
    app.run(debug=True)
