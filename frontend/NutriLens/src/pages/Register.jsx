import React, { useState } from 'react';
import mascot from '../assets/Nutrilens moscot.png';
import { NavLink, useNavigate } from 'react-router-dom';

const Register = ({ setIsLoggedIn }) => {  // 👈 Receive setIsLoggedIn prop

    const navigate = useNavigate();

    const [user, setUser] = useState({
        companyName: "", email: "", phone: "", password: "", cpassword: ""
    });

    const handleInput = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const postData = async (e) => {
        e.preventDefault();

        const { companyName, email, phone, password, cpassword } = user;

        try {
            const res = await fetch('/api/register', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    companyName, email, phone, password, cpassword
                })
            });

            const data = await res.json();

            if (res.status === 201) {
                localStorage.setItem('token', data.token);
                setIsLoggedIn(true);  // 👈 Update login state globally
                window.alert('Registration Successful!');
                navigate('/landing');
            } else {
                window.alert(data.message || 'Registration Failed!');
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
           Join NutriLens, Your Health Buddy !
          </h1>
                <img
                    src={mascot}
                    alt="NutriLens Mascot"
                    className="w-64 md:w-72 h-auto animate-bounce-slow-subtle"
                />
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md border-l-4 border-r-4 border-indigo-400">
                <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-500 to-indigo-700 text-transparent bg-clip-text">
                    Register
                </h2>

                <form method="POST" className="space-y-4" onSubmit={postData}>
                    <div>
                        <label htmlFor="companyName" className="block text-gray-700 font-medium">Name</label>
                        <input type="text" id="companyName" name="companyName" placeholder="Enter your name" value={user.companyName} onChange={handleInput}
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
                        <input type="email" id="email" name="email" placeholder="Enter your email" value={user.email} onChange={handleInput}
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-gray-700 font-medium">Phone Number</label>
                        <input type="tel" id="phone" name="phone" placeholder="Enter your phone number" value={user.phone} onChange={handleInput}
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-700 font-medium">Password</label>
                        <input type="password" id="password" name="password" placeholder="Enter password" value={user.password} onChange={handleInput}
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <div>
                        <label htmlFor="cpassword" className="block text-gray-700 font-medium">Confirm Password</label>
                        <input type="password" id="cpassword" name="cpassword" placeholder="Confirm password" value={user.cpassword} onChange={handleInput}
                            className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500" />
                    </div>

                    <NavLink to='/login' className="text-indigo-600 hover:underline text-sm block mt-2">
                        Already registered? Login here!
                    </NavLink>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded mt-4">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
