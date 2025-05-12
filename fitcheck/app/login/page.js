"use client";

import MainLayout from "../components/layout.jsx";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
      } else {
        setMessage(data.message);
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('user_id', data.user.id);
        console.log('Access token saved:', data.token);
        console.log('User ID saved:', data.user.id);
        // Redirect to dashboard or another page
        setTimeout(() => {
          window.location.href = '/dashboard';
        }
        , 2000); // Redirect after 2 seconds

      }
    } catch (err) {
      console.error('Error during fetch:', err);
      setError('An error occurred');
    }
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
        <source src= "/pinkoutfit.mp4" type="video/mp4" />
      </video>

      <div className="flex items-center justify-center h-screen px-10 relative z-10">
        <div className="bg-zinc-700/90 backdrop-blur-sm p-10 rounded-xl shadow-xl max-w-md w-full space-y-6">
          <h1 className="text-4xl font-bold text-center">Login</h1>

          {error && (
            <div className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg shadow mb-4">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm mb-1">
                Email
              </label>
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
              <label htmlFor="password" className="block text-sm mb-1">
                Password
              </label>
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
              Sign In
            </button>
          </form>
          <p className="text-sm text-center text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-zinc-200 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}