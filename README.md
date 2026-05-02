<div align="center">

<img src="frontend/NutriLens/src/assets/Nurilens Logo Colored.png" alt="NutriLens Logo" width="120"/>

# NutriLens

### AI-Powered Food Label Scanner & Nutrition Analyzer

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com)
[![OpenAI](https://img.shields.io/badge/GPT--4o--mini-OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-Google-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

**Point your camera at any food label → Get instant AI-powered nutrition analysis personalized to your diet.**

[Features](#-features) • [Demo](#-demo) • [Architecture](#-architecture) • [Setup](#-setup) • [API](#-api-reference) • [Team](#-team)

</div>

---

## 📌 What is NutriLens?

NutriLens is a full-stack web application that helps people make informed food choices by instantly analyzing packaged food labels. Users can **upload an image or use their phone's camera** to scan any food product — NutriLens extracts the ingredients and nutrition facts using OCR, then uses GPT-4o-mini to analyze them against the user's personal dietary preferences, allergies, and health goals.

Built as a B.Tech final year project, awarded **EX grade**. Tested on real Indian food packaging with 85–95% OCR accuracy.

---

## ✨ Features

- **📷 Dual Scan Modes** — Upload an image or use live camera capture with crop-before-scan
- **🔍 Custom OCR Pipeline** — PaddleOCR with preprocessing, box merging, and ingredient extraction tuned for Indian packaging
- **🤖 AI Nutrition Analysis** — GPT-4o-mini analyzes ingredients against your preferences and returns structured health assessment
- **🎯 Personalized Preferences** — Diet type, allergies, health goals, ingredient warnings, region (FSSAI/Halal/Kosher), sustainability flags
- **📊 Structured Results** — Ingredient-by-ingredient status (Good/Moderate/Risky), nutrition facts, summary, and overall verdict
- **💬 AI Chatbot (Nutrii)** — Gemini 2.5 Flash powered nutrition assistant with image support
- **🔐 JWT Authentication** — Secure register/login with bcrypt password hashing
- **📱 Mobile Ready** — Rear camera support, responsive UI, tested on real devices via ngrok

---

## 🎬 Demo

> 📸 *Add your demo GIF here — record a 30-second scan-to-result flow using ScreenToGif*
![alt text](<Video Project.gif>)

```
Scan label → Crop image → OCR extracts text → AI analyzes → Result card with health score
```

### Screenshots
<img src="frontend/NutriLens/src/assets/Screenshot (303).png" width="120"/>
<img src="frontend/NutriLens/src/assets/Screenshot (304).png" width="120"/>
<img src="frontend/NutriLens/src/assets/Screenshot (305).png" width="120"/>
<img src="frontend/NutriLens/src/assets/Screenshot (306).png" width="120"/>
<img src="frontend/NutriLens/src/assets/Screenshot (307).png" width="120"/>

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)               │
│                                                               │
│  Landing → Login/Register → Scanner → Result → Chatbot       │
│                                                               │
│  Camera Capture ──┐                                          │
│                   ├──► Crop UI (react-easy-crop)             │
│  Image Upload ────┘         │                                │
│                             ▼                                │
│              POST /api/upload (FormData + JWT)               │
└─────────────────────────┬───────────────────────────────────┘
                          │ Vite Proxy
┌─────────────────────────▼───────────────────────────────────┐
│                      BACKEND (Flask)                          │
│                                                               │
│  /upload                                                      │
│    resize_image()                                             │
│    preprocess_image()  ──► Grayscale + Adaptive Threshold     │
│    PaddleOCR.ocr()     ──► Raw text boxes                     │
│    merge_nearby_boxes() ─► Merge spatially close text        │
│    extract_ingredient_section() ─► Isolate ingredients       │
│    split → filter → format                                    │
│         │                                                     │
│  /analyze                                                     │
│    Build structured prompt with ingredients + preferences     │
│    GPT-4o-mini ──► JSON: nutrition, ingredients[], summary    │
│         │                                                     │
│  /chat                                                        │
│    Gemini 2.5 Flash ──► Conversational nutrition Q&A         │
│                                                               │
│  Auth: /register, /login, /logout (JWT + bcrypt + MongoDB)   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    MongoDB Atlas                               │
│         Users collection (email, hashed password, tokens)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7 |
| Backend | Flask, Flask-JWT-Extended, Flask-PyMongo, Flask-Mail |
| OCR | PaddleOCR (PP-OCRv4), OpenCV, NumPy |
| AI Analysis | GPT-4o-mini (OpenAI) |
| AI Chatbot | Gemini 2.5 Flash (Google) |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Image Cropping | react-easy-crop |
| SSL | certifi (Python 3.11) |

---

## ⚙️ Setup

### Prerequisites

- Python 3.11
- Node.js 18+
- MongoDB Atlas account
- OpenAI API key
- Google Gemini API key

---

### 1. Clone the repository

```bash
git clone https://github.com/AradwadTushar/NutriLens---An-Ingredient-Scanner-
cd ingredient-scanner-app
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment with Python 3.11
py -3.11 -m venv venv311
venv311\Scripts\activate        # Windows
# source venv311/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt
pip install -r requirements_working.txt
```

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/NutriLensDB?retryWrites=true&w=majority
JWT_SECRET_KEY=your-super-secret-jwt-key
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

> ⚠️ Never commit `.env` to GitHub. It is already in `.gitignore`.

Start the backend:

```bash
python app.py
```

You should see:
```
✅ Mongo Connected Successfully
✅ OCR warmed up
* Running on http://127.0.0.1:5000
```

---

### 3. Frontend Setup

```bash
cd frontend/NutriLens

# Install dependencies
npm install

# Install crop library if not present
npm install react-easy-crop
```

The Vite proxy in `vite.config.js` forwards all `/api/*` requests to `http://localhost:5000` automatically — no additional config needed.

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### 4. Mobile Testing (Optional)

To test on a real phone camera:

```bash
# Install ngrok
npm install -g ngrok

# Expose frontend
ngrok http 5173
```

Open the generated `https://xxx.ngrok.io` URL on your phone. The rear camera will be used automatically for live capture.

> Both your phone and laptop must be on the same network, or use ngrok for remote access.

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET_KEY` | Secret key for JWT token signing |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o-mini analysis |
| `GEMINI_API_KEY` | Google AI Studio key for Gemini chatbot |
| `MAIL_USERNAME` | Gmail address for welcome emails |
| `MAIL_PASSWORD` | Gmail App Password (not your Gmail password) |

---

## 📡 API Reference

All routes except `/register` and `/login` require:
```
Authorization: Bearer <jwt_token>
```

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/register` | Create new account |
| `POST` | `/login` | Login, returns JWT token |
| `POST` | `/logout` | Invalidate token |
| `POST` | `/upload` | Upload food label image → returns OCR data |
| `POST` | `/analyze` | Send OCR data + preferences → returns AI analysis |
| `POST` | `/chat` | Send message to Nutrii chatbot |

### Example: `/analyze` request

```json
{
  "ingredients": ["Sugar", "Palm Oil", "Refined Wheat Flour"],
  "preferences": {
    "diet": "Vegetarian",
    "allergies": ["Nut-Free"],
    "healthGoal": "Weight Loss",
    "warnings": ["High Sugar"],
    "region": "FSSAI",
    "sustainability": "Palm Oil"
  },
  "merged_text_lines": ["..."],
  "cleaned_text": "..."
}
```

### Example: `/analyze` response

```json
{
  "nutrition": {
    "calories": "573 Kcal",
    "protein": "14.7 g",
    "carbs": "46.5 g",
    "fat": "34.2 g",
    "sodium": "673 mg",
    "fiber": "10.7 g"
  },
  "ingredients": [
    { "name": "Sugar", "status": "Risky", "description": "High sugar content, not suitable for weight loss." },
    { "name": "Palm Oil", "status": "Risky", "description": "Sustainability concern flagged." }
  ],
  "summary": {
    "safe": "Contains vegetarian ingredients.",
    "warning": "High in sugar and sodium.",
    "avoid": "Refined wheat flour and palm oil."
  },
  "verdict": "Not recommended"
}
```

---

## 📁 Project Structure

```
ingredient-scanner-app/
│
├── backend/
│   ├── app.py                  # Flask app — all routes and OCR pipeline
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # 🔒 Not committed
│   └── static/uploads/         # Temporary uploaded images
│
└── frontend/NutriLens/
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx     # Home/marketing page
    │   │   ├── Login.jsx       # Animated login with mascot
    │   │   ├── Register.jsx    # Registration
    │   │   ├── scanner.jsx     # Main scan interface + crop
    │   │   └── result.jsx      # Analysis results display
    │   ├── components/
    │   │   ├── Navbar.jsx      # Responsive navbar + mobile drawer
    │   │   ├── GeminiChatbot.jsx # Floating AI assistant
    │   │   ├── AboutTeam.jsx   # About + team page
    │   │   └── result/         # Result sub-components
    │   │       ├── HealthScore.jsx
    │   │       ├── IngredientCard.jsx
    │   │       ├── NutritionCard.jsx
    │   │       ├── SummaryCard.jsx
    │   │       └── RecommendationCard.jsx
    │   └── assets/             # Logo, mascot, images
    ├── vite.config.js          # Vite + proxy config
    └── package.json
```

---

## 🔒 Security

- All secrets stored in `.env` — never hardcoded
- JWT authentication on all scan and analysis routes
- `werkzeug.utils.secure_filename` prevents path traversal attacks
- Gemini API key proxied through backend — never exposed to browser
- MongoDB connection uses TLS with `certifi` certificate bundle
- Passwords hashed with `bcrypt`

---

## 🚧 Known Limitations

- OCR accuracy drops on curved packaging or low-resolution images
- Ingredient extraction depends on standard label formatting — unconventional layouts may reduce accuracy
- Free-tier API rate limits apply for OpenAI and Gemini
- PaddleOCR takes ~30 seconds to initialize on first server start

---

## 🗺 Roadmap

- [ ] React Native mobile app (Expo)
- [ ] Scan history saved per user
- [ ] Saved user preferences (no re-selecting each time)
- [ ] Barcode scanning → auto-fetch product data
- [ ] Multi-language label support (Hindi, Marathi)
- [ ] Offline OCR mode

---

## 👥 Team

Tushar Aradwad 
Full Stack + AI 
[@tushar](https://github.com/AradwadTushar) 
[LinkedIn](https://www.linkedin.com/in/tushar-aradwad-536570307?utm_source=share_via&utm_content=profile&utm_medium=member_android)


---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](/LICENSE) for details.

---

## 🙏 Acknowledgements

- [PaddlePaddle](https://github.com/PaddlePaddle/PaddleOCR) for the OCR engine
- [OpenAI](https://openai.com) for GPT-4o-mini
- [Google AI](https://ai.google.dev) for Gemini 2.5 Flash
- [MongoDB Atlas](https://www.mongodb.com/atlas) for the database
- Our college and professors for the opportunity to build and present this work

---

<div align="center">

Built with ❤️ by Team NutriLens | B.Tech Final Year Project | 2024–25

*"Know what you eat before you eat it."*

</div>