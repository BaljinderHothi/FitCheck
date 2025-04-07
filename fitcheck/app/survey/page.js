'use client';

import { useState } from 'react';

export default function OnboardingSurvey() {
  const [responses, setResponses] = useState({
    prefersCasual: null,
    likesBrightColors: null,
    prefersFormal: null,
    shopsSustainable: null,
    likesMinimalist: null,
  });

  const handleChange = (question, value) => {
    setResponses({ ...responses, [question]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User Preferences:', responses);
    alert('Thank you for completing the survey!');
    // You can send the responses to your backend here
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Clothing Preferences Survey</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1 */}
          <div>
            <p className="font-medium mb-2">Do you prefer casual clothing?</p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleChange('prefersCasual', true)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.prefersCasual === true
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleChange('prefersCasual', false)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.prefersCasual === false
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 2 */}
          <div>
            <p className="font-medium mb-2">Do you like bright colors?</p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleChange('likesBrightColors', true)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.likesBrightColors === true
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleChange('likesBrightColors', false)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.likesBrightColors === false
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 3 */}
          <div>
            <p className="font-medium mb-2">Do you prefer formal outfits?</p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleChange('prefersFormal', true)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.prefersFormal === true
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleChange('prefersFormal', false)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.prefersFormal === false
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 4 */}
          <div>
            <p className="font-medium mb-2">Do you shop from sustainable brands?</p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleChange('shopsSustainable', true)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.shopsSustainable === true
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleChange('shopsSustainable', false)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.shopsSustainable === false
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Question 5 */}
          <div>
            <p className="font-medium mb-2">Do you prefer minimalist styles?</p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleChange('likesMinimalist', true)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.likesMinimalist === true
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleChange('likesMinimalist', false)}
                className={`w-1/2 py-2 rounded-lg ${
                  responses.likesMinimalist === false
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Submit Preferences
          </button>
        </form>
      </div>
    </div>
  );
}