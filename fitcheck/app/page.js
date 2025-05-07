"use client";

import Image from "next/image";
import Link from "next/link";
import MainLayout from "./components/layout.jsx";

export default function Home() {
  return (
    <MainLayout>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src= "/purplevid.mp4" type="video/mp4" />
      </video>

      {/* Main Page Content */}
      <div className="flex items-center justify-start h-screen px-10 relative z-10">
        <div className="flex flex-col justify-center items-start text-left space-y-8 max-w-md">
          <h1 className="text-6xl font-extrabold">Fit Check</h1>
          <p className="text-2xl mt-2 text-zinc-200 font-medium">Your personal shopper, powered by you.</p>
          <div className="space-x-6">
            <Link href="/login">
              <button className="bg-zinc-700 px-6 py-3 text-lg rounded-lg hover:bg-zinc-600 transition">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-zinc-700 px-6 py-3 text-lg rounded-lg hover:bg-zinc-600 transition">
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>

      <section className="relative z-10 px-10 py-24 text-white bg-black/60 backdrop-blur-md">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">What is Fit Check?</h2>
          <p className="text-lg leading-relaxed">
            Fit Check helps you make smarter online shopping decisions.
            Based on your preferences and reviews, we give you personalized feedback 
            to make sure you’re not wasting money on things you won’t like.
            You can even track spending with budget tools and review history. Sign up today!
          </p>
        </div>
      </section>

      <section className="relative z-10 px-10 py-16 bg-black/70 text-white backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
      {/* card 1 */}
        <div className="p-6 border border-white/20 rounded-xl transition transform hover:-translate-y-2 hover:scale-105 hover:bg-white/10 duration-300 shadow-lg backdrop-blur-sm">
          <h3 className="text-2xl font-semibold mb-4">🧠 Take the Quiz</h3>
            <p className="text-white/90">Start with a quick survey that helps us understand your shopping style and personality.</p>
        </div>

      {/* card 2 */}
        <div className="p-6 border border-white/20 rounded-xl transition transform hover:-translate-y-2 hover:scale-105 hover:bg-white/10 duration-300 shadow-lg backdrop-blur-sm">
          <h3 className="text-2xl font-semibold mb-4">🛍️ Browse Confidently</h3>
            <p className="text-white/90">Get personalized product feedback as you shop — no more second guessing.</p>
        </div>

      {/* card 3 */}
        <div className="p-6 border border-white/20 rounded-xl transition transform hover:-translate-y-2 hover:scale-105 hover:bg-white/10 duration-300 shadow-lg backdrop-blur-sm">
          <h3 className="text-2xl font-semibold mb-4">💸 Track Your Spending</h3>
            <p className="text-white/90">Set weekly budgets, track purchases, and even export them for later.</p>
        </div>
      </div>
      </div>
      </section>


      {/* Shirt Image */}
      <div className="hidden lg:block fixed top-0 right-0 w-1/2 h-full">
        <Image
          src="/shirt.png"
          alt="Black Shirt"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
    </MainLayout>
  );
}
