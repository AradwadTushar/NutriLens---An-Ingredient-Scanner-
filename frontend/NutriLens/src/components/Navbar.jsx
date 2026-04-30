import React from 'react';
import { Disclosure, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/Nutrilens logo white.png'

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);  
    navigate('/login');
    window.alert('Logged out successfully!');
  };

  return (
  <Disclosure as="nav" className="bg-gradient-to-r from-indigo-500 to-blue-500 shadow-lg rounded-xl mx-4 mt-4 p-3">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">

        {/* Logo + Links */}
        <div className="flex items-center space-x-6">
          <img
            alt="NutriLens"
            src={logo}
            className="h-10 w-auto rounded-md shadow"
          />

          {isLoggedIn && (
            <div className="flex space-x-4">
              <NavLink to="/team" className="text-white font-medium hover:text-gray-200 transition">
                Team
              </NavLink>
              <NavLink to="/about" className="text-white font-medium hover:text-gray-200 transition">
                About Us
              </NavLink>
              <NavLink to="/landing" className="text-white font-medium hover:text-gray-200 transition">
                Dashboard
              </NavLink>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <Menu as="div" className="relative">
              <div>
                <MenuButton className="flex rounded-full ring-2 ring-white hover:ring-offset-2 hover:ring-indigo-200 transition">
                  <img
                    alt="Profile"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="size-9 rounded-full shadow"
                  />
                </MenuButton>
              </div>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                <MenuItem>
                  <NavLink to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </NavLink>
                </MenuItem>
                <MenuItem>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          ) : (
            <div className="flex space-x-2">
              <NavLink to="/login" className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg font-medium shadow hover:bg-gray-100 transition">
                Login
              </NavLink>
              <NavLink to="/register" className="bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-medium shadow hover:bg-indigo-800 transition">
                Register
              </NavLink>
            </div>
          )}
        </div>

      </div>
    </div>
  </Disclosure>
);

};

export default Navbar;
