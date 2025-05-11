"use client";

import { Main } from "next/document";
import Image from "next/image";
import { useState } from "react";
import MainLayout from "../components/layout.jsx";

export default function Dashboard() {

  const [showStyleResults, setShowStyleResults] = useState(false);


  return (
    
    <div className="min-h-screen bg-black text-white px-8 py-12">

      <h1 className="text-4xl font-bold mb-6">Welcome back, Amina ✨</h1>
      <p className="text-lg text-zinc-300 mb-12">
        Based on your style quiz, here’s what’s trending in your vibe this week:
      </p>

    
      <section className="mb-16">
  <h2 className="text-2xl font-semibold mb-4"> Curated for You</h2>

  <div className="relative">
    {/* Scroll container */}
    <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-2">
      {[
        { name: "Ivory Ribbed Maxi Dress", price: "$78.00", match: "94%", image: "/dress.jpg" },
        { name: "Beige Crescent Shoulder Bag", price: "$49.99", match: "91%", image: "/bag.jpg" },
        { name: "Vintage Gold Hoops", price: "$19.50", match: "89%", image: "/hoops.jpg" },
        { name: "Brown Silk Skirt", price: "$39.99", match: "88%", image: "/skirt.jpg" },
        { name: "Satin Square Scarf", price: "$22.00", match: "86%", image: "/scarf.jpg" },
        { name: "Structured Canvas Tote", price: "$30.00", match: "90%", image: "/tote.jpg" },
      ].map((item, i) => (
        <div key={i} className="min-w-[250px] bg-zinc-900 p-4 rounded-xl shadow-lg hover:scale-[1.02] transition">
          <img src={item.image} alt={item.name} className="rounded-md mb-4 h-40 w-full object-cover" />
          <h3 className="text-xl font-semibold">{item.name}</h3>
          <p className="text-pink-400">{item.price}</p>
          <p className="text-green-400 text-sm mt-1">Match Score: {item.match}</p>
        </div>
      ))}
    </div>
  </div>
</section>


      
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4"> Weekly Budget</h2>
        <p className="mb-2">Budget: $120.00 | Spent: $0.00</p>
        <div className="bg-zinc-800 h-4 w-full rounded-full">
          <div className="bg-pink-500 h-4 rounded-full w-[1%] transition-all"></div>
        </div>
      </section>

      
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-4"> Your Style Profile</h2>
        <ul className="list-disc pl-5 text-zinc-300 space-y-1">
          <li>Soft neutrals & clean silhouettes</li>
          <li>Favorite category: Silk, Vintage, Dress</li>
          <li>Shopping Mood: Aesthetic-first 🤍</li>
          <li>Average price range: $40–$70</li>
        </ul>
      </section>

      
      <section className="mb-16">
        <button
          className="bg-pink-600 px-5 py-3 rounded-lg hover:bg-pink-500 transition"
          onClick={() => alert("Download complete! (Fake but fabulous 😌)")}
        >
          Export Weekly Purchases to CSV
        </button>
      </section>


    </div>
  );
}
