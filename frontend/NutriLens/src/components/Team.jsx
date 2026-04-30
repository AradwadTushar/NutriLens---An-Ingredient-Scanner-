import React from 'react';
import meImg from '../assets/me.jpg';
import shrImg from '../assets/shr.jpg';
import siddImg from '../assets/sidd.jpg';


const people = [
  {
    name: 'Aradwad Tushar',
    role: 'Frontend / Backend Developer',
    imageUrl: meImg,
  },
  {
    name: 'Shriprasad Bembde',
    role: 'Chatbot Developer',
    imageUrl:shrImg,
  },
  {
    name: 'Morkhande Siddheshwar',
    role: 'Ui/Ux Developer',
    imageUrl: siddImg,
  },
];

export default function Team() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-20 px-6 lg:px-8 xl:grid-cols-3">
        
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-pretty text-indigo-700 sm:text-4xl">
            Meet our leadership
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600">
            We’re a passionate team behind NutriLens — blending AI, design, and tech  
            to help people make smarter food choices with confidence.
          </p>
        </div>

        <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2">
          {people.map((person) => (
            <li key={person.name}>
              <div className="flex items-center gap-x-6">
                <img alt={person.name} src={person.imageUrl} className="size-16 rounded-full" />
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-gray-900">{person.name}</h3>
                  <p className="text-sm font-semibold text-indigo-600">{person.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
