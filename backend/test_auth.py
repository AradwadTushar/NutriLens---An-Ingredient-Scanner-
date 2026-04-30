from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token
import traceback
from flask_mail import Mail, Message


app = Flask(__name__)
CORS(app)

# ✅ Correct MONGO_URI and database name
app.config['MONGO_URI'] = 'mongodb+srv://aradwadtushar72:destroy@cluster0.fnokrlt.mongodb.net/NutriLnesDB?retryWrites=true&w=majority'

mongo = PyMongo(app)

app.secret_key = 'secret key'
app.config['JWT_SECRET_KEY'] = 'this-is-secret-key'
jwt_manager = JWTManager(app)

# ✅ Add Gmail SMTP config here
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'nutrilensorg@gmail.com'   # Replace with your Gmail
app.config['MAIL_PASSWORD'] = 'olpp cnzu qijc lqve'      # Replace with your generated app password

mail = Mail(app)

@app.route('/')
def home():
    return "NutriLens Auth Test Running ✅"

@app.route('/register', methods=['POST'])
def userRegister():
    allusers = mongo.db.users
    
    user = allusers.find_one({'email': request.json['email']})
    companyName = allusers.find_one({'companyName': request.json['companyName']})
    phone = allusers.find_one({'phone': request.json['phone']})
    
    if user:
        return jsonify(message='Email already exists'), 401
    if companyName:
        return jsonify(message='Company Name already exists'), 401
    if phone:
        return jsonify(message='Phone number already exists'), 401
    if request.json['password'] != request.json['cpassword']:
        return jsonify(message='Password not matching!'), 401
    
    hashed_pw = bcrypt.hashpw(
        request.json['password'].encode('utf-8'), bcrypt.gensalt()
    ).decode('utf-8')  # ✅ Convert bytes to string
    
    access_token = create_access_token(identity=request.json['email'])
    
    allusers.insert_one({
        'email': request.json['email'],
        'companyName': request.json['companyName'],
        'phone': request.json['phone'],
        'password': hashed_pw,
        'tokens': [{ 'token': access_token }]
    })
    
    # ✅ Send welcome email
    msg = Message(
        subject="Welcome to NutriLens 🥗",
        sender=app.config['MAIL_USERNAME'],
        recipients=[request.json['email']],
        body=f"Hi {request.json['companyName']},\n\nWelcome to NutriLens, your Health Buddy! 🎉\n\nYour account is now active.\n\nStay Healthy,\nNutriLens Team"
    )
    mail.send(msg)

    
    return jsonify(token=access_token), 201



@app.route('/login', methods=['POST'])
def userLogin():
    allusers = mongo.db.users
    user = allusers.find_one({'email': request.json['email']})
    
    if user:
        if bcrypt.checkpw(request.json['password'].encode('utf-8'), user['password'].encode('utf-8')):
            
            access_token = create_access_token(identity=request.json['email'])
            
            allusers.update_one(
                {'_id': user['_id']},
                {'$push': {'tokens': {'token': str(access_token)}}}
            )
            
            return jsonify(token=str(access_token)), 201

    return jsonify(message='Invalid email/password'), 401


@app.route('/logout', methods=['POST'])
def userLogout():
    allusers = mongo.db.users
    user = allusers.find_one({'tokens.token': request.json['auth']})
    
    if user:
        allusers.update_one(
            {'_id': user['_id']},
            {'$set': {'tokens': []}}
        )
        return jsonify(message='Logout Successful'), 201

    return jsonify(message='Logout Failed'), 401

        

# 🔥 Global error handler
@app.errorhandler(Exception)
def handle_exception(e):
    print("🔥 Backend Error:")
    traceback.print_exc()
    return jsonify(message="Internal Server Error 💥"), 500

if __name__ == '__main__':
    app.run(debug=True)
