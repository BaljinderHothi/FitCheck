"use client";

// import Image from "next/image";
import { useEffect, useState } from "react";
import MainLayout from "../components/layout.jsx";

export default function Dashboard() {
  const [userName, setUserName] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

        if (Array.isArray(result.reviews)) {
          setReviews(result.reviews);
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    const fetchRecommendations = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await fetch("/api/user_rec/getRec", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) {
          console.error("Recommendation API error:", result.error);
          return;
        }

        setRecommendations(result.recommendations || []);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      } finally {
        // Force spinner to stay for at least 10 seconds
        setTimeout(() => setLoading(false), 10000);
      }
    };

    fetchUserData();
    fetchRecommendations();
  }, []);

  return (
    <MainLayout>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/pinkvid.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 min-h-screen bg-black/70 text-white px-8 py-12 backdrop-blur-sm">
        <h1 className="text-4xl font-bold mb-6">
          Welcome back{userName ? `, ${userName}` : ""} ✨
        </h1>
        <p className="text-lg text-zinc-300 mb-12">
          Based on your reviews, we’re preparing your dashboard.
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {recommendations.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-semibold mb-4">Recommended for You</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-white border border-zinc-600 rounded-2xl overflow-hidden bg-zinc-800/80">
                    <thead className="bg-zinc-700/80">
                      <tr>
                        <th className="text-left px-6 py-3 border-b border-zinc-600">Product Name</th>
                        <th className="text-left px-6 py-3 border-b border-zinc-600">Description</th>
                        <th className="text-left px-6 py-3 border-b border-zinc-600">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendations.map((item, index) => (
                        <tr key={index} className="hover:bg-zinc-700/80 transition">
                          <td className="px-6 py-4 border-b border-zinc-700">
                            <a
                              href={`https://www.amazon.com/s?k=${encodeURIComponent(item.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              {item.name}
                            </a>
                          </td>
                          <td className="px-6 py-4 border-b border-zinc-700">{item.description}</td>
                          <td className="px-6 py-4 border-b border-zinc-700 text-pink-400">{item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Your Product Reviews</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-white border border-zinc-600 rounded-2xl overflow-hidden bg-zinc-800/80">
                    <thead className="bg-zinc-700/80">
                      <tr>
                        <th className="text-left px-6 py-3 border-b border-zinc-600">Product</th>
                        <th className="text-left px-6 py-3 border-b border-zinc-600">Review</th>
                        <th className="text-left px-6 py-3 border-b border-zinc-600">Rating</th>
                        <th className="text-left px-6 py-3 border-b border-zinc-600">Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((item, index) => (
                        <tr key={index} className="hover:bg-zinc-700/80 transition">
                          <td className="px-6 py-4 border-b border-zinc-700">{item.product_name}</td>
                          <td className="px-6 py-4 border-b border-zinc-700">{item.review_text}</td>
                          <td className="px-6 py-4 border-b border-zinc-700 text-yellow-400">{item.star_rating} ★</td>
                          <td className="px-6 py-4 border-b border-zinc-700 text-green-400">{item.sentiment_label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
