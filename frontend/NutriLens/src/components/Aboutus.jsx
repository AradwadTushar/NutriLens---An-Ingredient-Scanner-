import React from 'react';

export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-indigo-100 flex flex-col items-center justify-center p-6 font-sans animate-fadeIn">
            <div className="bg-gradient-to-r from-indigo-700 to-blue-600 bg-opacity-90 text-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-4xl text-center mb-12 animate-slideUp">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About NutriLens 👁️‍🗨️</h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
                    NutriLens is your smart companion for understanding food like never before. We empower users to decode ingredients, analyze food labels, and personalize nutritional choices — all backed by AI. It's health made simple, clear, and accessible. 💙
                </p>
            </div>

            <div className="max-w-3xl bg-gradient-to-r from-indigo-100 to-blue-100 bg-opacity-80 p-6 md:p-8 rounded-2xl shadow-xl text-center animate-fadeInSlow">
                <h2 className="text-2xl md:text-3xl font-semibold text-indigo-700 mb-4">Why NutriLens?</h2>
                <p className="text-gray-700 text-lg mb-6">
                    Food packaging can be confusing. Ingredients often hide behind complex terms. With NutriLens, just scan and understand. Get transparent, AI-driven analysis tailored to your health goals.
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold text-indigo-700 mb-4">Our Mission 🚀</h2>
                <p className="text-gray-700 text-lg">
                    Empower every individual to make informed food decisions with confidence. Whether you're tracking ingredients, watching your health, or curious about what's in your food — NutriLens simplifies it all.
                </p>
            </div>
        </div>
    );
}

/* Tailwind Custom Animations (add in your global CSS if not present) */
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInSlow {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.6s ease-out both; }
.animate-fadeInSlow { animation: fadeInSlow 1s ease-out both; }
.animate-slideUp { animation: slideUp 0.8s ease-out both; }
*/
