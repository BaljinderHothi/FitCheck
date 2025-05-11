"use client";

import MainLayout from "../components/layout.jsx";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      console.log('Sending request to /api/auth/signup with:', { email, password, first_name: firstName, last_name: lastName, gender });
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          gender,
        }),
      });

      const data = await response.json();
      console.log('Response from /api/auth/signup:', data);

      if (!response.ok) {
        setError(data.error || 'An error occurred');
      } else {
        setMessage(data.message);
        router.push('/survey');
      }
    } catch (err) {
      console.error('Error during fetch:', err);
      setError('An error occurred');
    }

    console.log('First Name:', firstName);
    console.log('Last Name:', lastName);
    console.log('Email:', email);
    console.log('Gender:', gender);
  };

  return (
    <MainLayout>

      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src= "/pinkvid.mp4" type="video/mp4" />
      </video>
      
      <div className="flex items-center justify-center h-screen px-10 relative z-10">
        <div className="bg-zinc-800 p-10 rounded-xl shadow-xl max-w-md w-full space-y-6">
          <h1 className="text-4xl font-bold text-center">Register</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="firstName" className="block text-sm mb-1">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  required
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="lastName" className="block text-sm mb-1">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                required
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm mb-1">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                required
              >
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm mb-1">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-zinc-600 hover:bg-zinc-500 transition px-4 py-2 rounded-lg text-white font-semibold"
            >
              Create Account
            </button>
          </form>
          <p className="text-sm text-center text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="text-zinc-200 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
