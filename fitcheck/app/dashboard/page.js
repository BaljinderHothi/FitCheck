"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import MainLayout from "../components/layout.jsx";

export default function Dashboard() {
  const [userName, setUserName] = useState(null);

useEffect(() => {
  const fetchUserData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch("/api/userinfo/userInfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("API error:", result.error);
        return;
      }

      if (result.user?.first_name && result.user?.last_name) {
        setUserName(`${result.user.first_name} ${result.user.last_name}`);
      }

      // Optional: handle reviews result.reviews
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  fetchUserData();
}, []);

  // Optional: handle reviews result.reviews
  // You can set up state for reviews and display them in the component - TO DO LATER

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

<div className="relative z-10 min-h-screen bg-black/70 text-white px-8 py-12 backdrop-blur-sm">
  <h1 className="text-4xl font-bold mb-6">
    Welcome back{userName ? `, ${userName}` : ""} ✨
  </h1>
  <p className="text-lg text-zinc-300 mb-12">
    Based on your reviews, we’re preparing your dashboard.
  </p>
</div>

    </MainLayout>
  );
}
