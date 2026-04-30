import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import mascot from '../assets/Nutrilens moscot.png';

const Login = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const setData = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/login', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.status === 201) {
                localStorage.setItem('token', data.token);
                setIsLoggedIn(true);
                window.alert('Login Successful!');
                navigate('/landing');
            } else {
                window.alert(data.message || 'Login Failed!');
            }
        } catch (err) {
            console.error(err);
            window.alert('Something went wrong!');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-white relative overflow-hidden p-4">

            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-x drop-shadow-md text-center">
            Welcome To NutriLens ! Your Health Buddy !
          </h1>
                <img
                    src={mascot}
                    alt="NutriLens Mascot"
                    className="w-64 md:w-72 h-auto animate-bounce-slow-subtle"
                />
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md border-l-4 border-r-4 border-indigo-400">
                <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-500 to-indigo-700 text-transparent bg-clip-text">
                    Login
                </h2>

                <form className="space-y-4" onSubmit={setData}>
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-700 font-medium">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <NavLink to='/register' className="text-indigo-600 hover:underline text-sm block mt-2">
                        Not registered? Register here!
                    </NavLink>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded mt-4"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
