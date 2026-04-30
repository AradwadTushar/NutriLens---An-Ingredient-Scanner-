import { useNavigate } from 'react-router-dom';
import logo from '../assets/Nurilens Logo Colored.png';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex justify-center items-center relative overflow-hidden font-sans">

      {/* Floating background circles */}
      <div className="absolute w-64 h-64 bg-blue-300 rounded-full top-10 left-10 opacity-20 blur-3xl animate-float-slow"></div>
      <div className="absolute w-72 h-72 bg-purple-300 rounded-full bottom-20 right-20 opacity-20 blur-3xl animate-float-fast"></div>

      {/* Fullscreen card container */}
      <div className="group w-full h-full min-h-screen bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/30 shadow-2xl flex flex-col items-center justify-center space-y-6 p-8 md:p-12 transition-transform duration-300 hover:scale-[1.01]">

        {/* Logo */}
        <img
          src={logo}
          alt="NutriLens Logo"
          className="w-24 h-24 md:w-32 md:h-32 drop-shadow-xl hover:scale-105 transition duration-300 rounded-full"
        />

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient-x drop-shadow-md text-center leading-tight">
          NutriLens
        </h1>

        {/* Tagline */}
        <p className="text-base md:text-lg text-gray-800 text-center max-w-2xl px-4 leading-relaxed">
          Your AI-powered food label scanner — know what you eat in seconds.
        </p>

        {/* Subtext */}
        <p className="text-xs md:text-sm text-gray-600 text-center max-w-xl px-4 leading-snug">
          Detect hidden ingredients, get health warnings, and personalize choices based on your preferences.
        </p>

        {/* Hover buttons */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:scale-105 transition duration-300"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold px-6 py-2 rounded-full shadow-md hover:scale-105 transition duration-300"
          >
            Register
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-x {
            background-size: 200% auto;
            animation: gradient-x 3s linear infinite;
          }

          @keyframes float-slow {
            0% { transform: translate(0, 0); }
            50% { transform: translate(-10px, 20px); }
            100% { transform: translate(0, 0); }
          }

          @keyframes float-fast {
            0% { transform: translate(0, 0); }
            50% { transform: translate(15px, -10px); }
            100% { transform: translate(0, 0); }
          }
        `}
      </style>
    </div>
  );
}
