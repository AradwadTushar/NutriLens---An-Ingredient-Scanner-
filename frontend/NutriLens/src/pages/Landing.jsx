import { CalendarDaysIcon, HandRaisedIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Nurilens Logo Colored.png';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-white relative overflow-hidden">

      {/* Floating Circles */}
      <div className="absolute w-48 h-48 bg-indigo-300 rounded-full top-16 left-16 animate-bounce-slow-subtle opacity-70"></div>
      <div className="absolute w-64 h-64 bg-blue-300 rounded-full bottom-48 right-20 animate-bounce-slow-subtle opacity-60"></div>
      <div className="absolute w-28 h-28 bg-purple-300 rounded-full bottom-72 left-28 animate-bounce-slow-subtle opacity-70"></div>
      <div className="absolute w-20 h-20 bg-indigo-400 rounded-full top-10 right-32 animate-bounce-slow-subtle opacity-80"></div>

      {/* Hero Section */}
      <div className="flex justify-center items-center p-10 mt-20 relative z-10">
        <div className="max-w-6xl w-full bg-white shadow-2xl rounded-2xl p-10 flex flex-col items-center space-y-6 relative">
          <img src={logo} alt="NutriLens" className="w-28 h-28 drop-shadow-xl hover:scale-105 transition" />

          <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-x drop-shadow-md text-center">
            NutriLens
          </h1>

          <p className="text-lg text-gray-600 text-center max-w-3xl">
            Scan food labels, get instant health insights, and make better choices — powered by AI.
          </p>

          <button
            onClick={() => navigate('/scanner')}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition"
          >
            🚀 Get Started
          </button>

          <img src={logo} alt="NutriLens Stamp" className="absolute bottom-4 right-4 w-12 h-12 opacity-60 hover:opacity-100 transition" />
        </div>
      </div>

      {/* Middle Description Section */}
      <div className="max-w-4xl mx-auto text-left mt-20 px-4 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
          Welcome to NutriLens
        </h2>
        <p className="text-lg text-gray-700">
          Ever wondered what's really inside your favorite snacks or drinks? With NutriLens, simply scan the food label, and get instant, AI-driven analysis of ingredients, nutrition facts, and hidden health risks.
        </p>
        <p className="text-lg text-gray-700">
          Whether you're tracking calories, watching for allergens, following a specific diet, or just curious — NutriLens decodes complicated labels and gives you clear, reliable health insights in seconds.
        </p>
      </div>

      {/* Tagline Section before Footer */}
      <div className="mt-20 text-center">
        <h3 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
          Empowering Smarter Food Choices
        </h3>
        <p className="mt-2 text-gray-600 text-lg">
          Your nutrition, your rules — NutriLens makes understanding food simple.
        </p>
      </div>

      {/* Newsletter + Footer */}
      <div className="relative isolate overflow-hidden bg-gradient-to-r from-indigo-500 to-blue-500 py-16 sm:py-24 lg:py-32 mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            
            {/* Newsletter Form */}
            <div className="max-w-xl lg:max-w-lg">
              <h2 className="text-4xl font-semibold tracking-tight text-white">
                Stay Updated with NutriLens
              </h2>
              <p className="mt-4 text-lg text-indigo-100">
                Get the latest AI features, health tips, and food safety insights straight to your inbox.
              </p>
              <div className="mt-6 flex max-w-md gap-x-4">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="min-w-0 flex-auto rounded-md bg-white/10 px-3.5 py-2 text-white placeholder:text-indigo-200 outline-1 outline-white/20 focus:outline-2 focus:outline-indigo-300"
                />
                <button
                  type="submit"
                  className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-700 shadow hover:bg-indigo-100 transition"
                >
                  Subscribe
                </button>
              </div>
            </div>

            {/* Features */}
            <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
              <div className="flex flex-col items-start">
                <div className="rounded-md bg-white/10 p-2 ring-1 ring-white/20">
                  <CalendarDaysIcon className="size-6 text-white" />
                </div>
                <dt className="mt-4 text-base font-semibold text-white">Weekly Health Insights</dt>
                <dd className="mt-2 text-base text-indigo-100">
                  AI-powered nutrition facts, hidden ingredient breakdowns, and wellness guides.
                </dd>
              </div>

              <div className="flex flex-col items-start">
                <div className="rounded-md bg-white/10 p-2 ring-1 ring-white/20">
                  <HandRaisedIcon className="size-6 text-white" />
                </div>
                <dt className="mt-4 text-base font-semibold text-white">No Spam Guarantee</dt>
                <dd className="mt-2 text-base text-indigo-100">
                  Only helpful health updates. Unsubscribe anytime.
                </dd>
              </div>
            </dl>
          </div>

          {/* Footer Text */}
          <div className="mt-12 text-center text-indigo-100 text-sm">
            &copy; {new Date().getFullYear()} NutriLens — All Rights Reserved
          </div>
        </div>
      </div>

    </div>
  );
}
