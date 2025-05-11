"use client";

import MainLayout from "../components/layout.jsx";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

const fashionStyles = [
  "Streetwear",
  "Minimalist",
  "Y2K",
  "Vintage",
  "Aesthetic",
  "Athletic",
  "Dressy/Formal",
];

export default function SurveyPage() {
  const [ratings, setRatings] = useState({});
  const router = useRouter();

  const handleRating = (style, value) => {
    setRatings({ ...ratings, [style]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Survey Responses:", ratings);
    // TO DO Later: send ratings to Supabase
    router.push("/dashboard");
  };

  return (
    
    <MainLayout>
      <div className="px-6 py-12 max-w-3xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-center">Style Survey</h1>
        <form onSubmit={handleSubmit} className="space-y-10">
          {fashionStyles.map((style) => (
            <div
              key={style}
              className="space-y-2 border border-zinc-700 rounded-lg p-6 bg-zinc-800"
            >
              <h2 className="text-xl font-semibold">{style}</h2>
              <p className="text-sm text-zinc-400">
                How much do you expect to like this fashion style?
              </p>
              <div className="flex gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRating(style, value)}
                    className={`transition ${
                      ratings[style] >= value ? "text-yellow-400" : "text-zinc-500"
                    }`}
                  >
                    <Star fill={ratings[style] >= value ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-zinc-700 hover:bg-zinc-600 transition px-6 py-3 rounded-lg text-white font-semibold"
          >
            Submit Survey
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
