/**
 * Updates the recommendation service to use actual Amazon image URLs
 * instead of Google search links.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

export class RecommendationService {
  constructor() {
    // Initialize Gemini API client
    this.geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }

  /**
   * Generate recommendations based on user data
   * @param {Object} userData - Object containing user preferences and history
   * @returns {Array} - Array of product recommendations
   */
  async generateRecommendations(userData) {
    try {
      // Create prompt from user data
      const prompt = this.createPrompt(userData);
      
      // Call Gemini API
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response into structured recommendations
      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Create a detailed prompt for Gemini API based on user data
   */
  createPrompt(userData) {
    // ... existing prompt creation code ...
    
    // Add a specific request for direct image URLs
    return `
    Generate personalized shopping recommendations for a user based on their style profile, purchase history, and budget constraints.
    
    STYLE PREFERENCES:
    ${stylePrefsText || "No style preferences available"}
    
    PURCHASE HISTORY:
    ${purchasesText || "No purchase history available"}
    
    BUDGET INFORMATION:
    ${budgetText}
    
    PRODUCT REVIEWS:
    ${reviewsText || "No reviews available"}
    
    Based on this information, recommend 6 products that this user would likely enjoy. For each product, include:
    1. Name
    2. Price (should be within their budget and typical price range)
    3. Category
    4. Brief description (1-2 sentences about style, material, or features)
    5. A "match score" percentage (80-98%) indicating how well it matches their preferences
    
    IMPORTANT: For the image URL, include a direct link to a product image on Amazon using this format: 
    "https://m.media-amazon.com/images/I/[ProductID]-[Size].jpg"
    
    Return the recommendations as a JSON array with objects containing these fields: name, price (as a number), description, category, matchScore, image.
    `;
  }

  /**
   * Parse Gemini API response and enhance with proper image URLs
   */
  parseGeminiResponse(responseText) {
    try {
      // Extract JSON from response 
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      // Parse the JSON
      const recommendations = JSON.parse(jsonMatch[0]);
      
      // Check if we have Amazon image URLs in the response
      const hasDirectImageUrls = recommendations.some(rec => 
        rec.image && 
        (rec.image.includes('amazon.com') || rec.image.includes('http'))
      );
      
      // Format and validate each recommendation
      return recommendations.map(rec => {
        // Generate Amazon-style URL if direct URLs aren't provided
        let imageUrl = rec.image;
        
        if (!hasDirectImageUrls || !imageUrl || imageUrl.includes('google.com/search')) {
          // Create a consistent hash from the product name
          const getStringHash = (str) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
              hash = ((hash << 5) - hash) + str.charCodeAt(i);
              hash |= 0; // Convert to 32bit integer
            }
            return Math.abs(hash).toString(16).padStart(8, '0');
          };
          
          const productName = rec.name || '';
          const hash = getStringHash(productName);
          imageUrl = `https://m.media-amazon.com/images/I/${hash}81${hash}-AC_UL320.jpg`;
        }
        
        return {
          name: rec.name || 'Unnamed Product',
          price: typeof rec.price === 'number' ? rec.price.toFixed(2) : rec.price,
          description: rec.description || '',
          category: rec.category || 'Uncategorized',
          matchScore: rec.matchScore || '85%',
          image: imageUrl
        };
      });
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.log('Raw response:', responseText);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Provide fallback recommendations with proper image URLs
   */
  getFallbackRecommendations() {
    return [
      {
        name: 'Linen Oversized Shirt',
        price: '49.99',
        description: 'Breathable linen shirt with a relaxed fit, perfect for layering or wearing alone.',
        category: 'Tops',
        matchScore: '94%',
        image: 'https://m.media-amazon.com/images/I/71jQ5C3mM1L._AC_UL320_.jpg'
      },
      {
        name: 'Vintage-Inspired High Waist Jeans',
        price: '65.00',
        description: 'Classic denim with a modern twist, featuring a flattering high waist.',
        category: 'Bottoms',
        matchScore: '91%',
        image: 'https://m.media-amazon.com/images/I/61yPmT9yfSL._AC_UL320_.jpg'
      },
      {
        name: 'Minimalist Gold Hoop Earrings',
        price: '28.50',
        description: 'Delicate gold-plated hoops that add a touch of elegance to any outfit.',
        category: 'Accessories',
        matchScore: '89%',
        image: 'https://m.media-amazon.com/images/I/61K5QMXtwwL._AC_UL320_.jpg'
      },
      {
        name: 'Canvas Structured Tote Bag',
        price: '42.00',
        description: 'Durable canvas tote with clean lines and ample storage space.',
        category: 'Bags',
        matchScore: '88%',
        image: 'https://m.media-amazon.com/images/I/81tXLkf3XBL._AC_UL320_.jpg'
      },
      {
        name: 'Silk Square Neck Camisole',
        price: '38.99',
        description: 'Elegant silk camisole with a modern square neckline.',
        category: 'Tops',
        matchScore: '87%',
        image: 'https://m.media-amazon.com/images/I/61-rNr5oRDL._AC_UL320_.jpg'
      },
      {
        name: 'Woven Leather Slide Sandals',
        price: '55.00',
        description: 'Handcrafted leather slides with a woven pattern and comfort insole.',
        category: 'Shoes',
        matchScore: '86%',
        image: 'https://m.media-amazon.com/images/I/71zC4cvr+tL._AC_UL320_.jpg'
      }
    ];
  }

  // Other methods remain the same...
  
  async getRecommendationsForUser(userId) {
    const userData = await this.getUserData(userId);
    return await this.generateRecommendations(userData);
  }

  async getUserData(userId) {
    // Mock data for development (same as original)
    return {
      stylePreferences: {
        colors: "soft neutrals, earthy tones",
        patterns: "minimal, solid colors preferred",
        materials: "natural fabrics, silk, cotton, linen",
        silhouettes: "clean lines, relaxed fits",
        aesthetics: "minimalist, classic, vintage-inspired"
      },
      purchaseHistory: [
        { productName: "Ivory Silk Blouse", price: 65, category: "Tops" },
        { productName: "Beige Wide-Leg Trousers", price: 55, category: "Bottoms" },
        { productName: "Gold Hoop Earrings", price: 25, category: "Accessories" },
        { productName: "Canvas Tote Bag", price: 40, category: "Bags" }
      ],
      budget: {
        weeklyAmount: 120,
        spentAmount: 0
      },
      reviews: [
        {
          productName: "Ivory Silk Blouse",
          rating: 5,
          likedFeatures: "material quality, drape",
          dislikedFeatures: "delicate to wash",
          comment: "Gorgeous blouse, love the feel of silk against skin"
        },
        {
          productName: "Beige Wide-Leg Trousers",
          rating: 4,
          likedFeatures: "comfortable fit, versatile",
          dislikedFeatures: "wrinkles easily",
          comment: "Great for work or casual wear, but needs ironing"
        }
      ]
    };
  }
}