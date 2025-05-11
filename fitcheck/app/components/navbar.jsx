"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      {/* Navbar Toggle Button */}
      <button
        onClick={() => setShowNav(!showNav)}
        className="fixed top-4 left-4 z-30"
      >
        <Menu size={28} />
      </button>

      {/* Slide-In Navbar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-800 shadow-lg z-20 transform transition-transform duration-300 ease-in-out ${
          showNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowNav(false)}
          className="absolute top-4 right-4 z-30"
        >
          <X size={24} />
        </button>

        <nav className="flex flex-col p-6 space-y-4 mt-16">
        <Link href="./" className="text-lg hover:text-zinc-300 transition">
            Home
          </Link>
          <Link href="/login" className="text-lg hover:text-zinc-300 transition">
            Login
          </Link>
          <Link href="/register" className="text-lg hover:text-zinc-300 transition">
            Register
          </Link>
        </nav>
      </div>
    </>
  );
}
