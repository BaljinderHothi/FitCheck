import { GoogleGenerativeAI } from '@google/generative-ai';

// Uncomment for Supabase integration
// import { createClient } from '@supabase/supabase-js';
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * RecommendationService - Handles user data and generates personalized recommendations via Gemini API
 */
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
   * @param {Object} userData - User profile, preferences, and history
   * @returns {string} - Formatted prompt
   */
  createPrompt(userData) {
    const { 
      stylePreferences = {}, 
      purchaseHistory = [], 
      budget = {}, 
      reviews = [] 
    } = userData;
    
    // Format style preferences
    const stylePrefsText = Object.entries(stylePreferences)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    // Format purchase history
    const purchasesText = purchaseHistory
      .map(p => `${p.productName} ($${p.price}) - Category: ${p.category}`)
      .join('\n');
    
    // Format budget information
    const budgetText = `
    Weekly Budget: $${budget.weeklyAmount || 0}
    Spent This Week: $${budget.spentAmount || 0}
    Remaining Budget: $${(budget.weeklyAmount || 0) - (budget.spentAmount || 0)}
    `;
    
    // Format product reviews
    const reviewsText = reviews
      .map(r => `
        Product: ${r.productName}
        Rating: ${r.rating}/5
        Liked: ${r.likedFeatures || 'N/A'}
        Disliked: ${r.dislikedFeatures || 'N/A'}
        Feedback: ${r.comment || 'N/A'}
      `)
      .join('\n');
    
    // Create the complete prompt
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
    
    Return the recommendations as a JSON array with objects containing these fields: name, price (as a number), description, category, matchScore.
    `;
  }

  /**
   * Parse Gemini API response into structured recommendations
   * @param {string} responseText - Raw text response from Gemini
   * @returns {Array} - Formatted product recommendations
   */
  parseGeminiResponse(responseText) {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      // Parse the JSON
      const recommendations = JSON.parse(jsonMatch[0]);
      
      // Format and validate each recommendation
      return recommendations.map(rec => ({
        name: rec.name || 'Unnamed Product',
        price: typeof rec.price === 'number' ? rec.price.toFixed(2) : rec.price,
        description: rec.description || '',
        category: rec.category || 'Uncategorized',
        matchScore: rec.matchScore || '85%',
        // Add placeholder image path
        image: `/placeholder-${rec.category?.toLowerCase().replace(/\s+/g, '-') || 'product'}.jpg`
      }));
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.log('Raw response:', responseText);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Provide fallback recommendations if Gemini API fails
   * @returns {Array} - Default recommendations
   */
  getFallbackRecommendations() {
    return [
      {
        name: 'Linen Oversized Shirt',
        price: '49.99',
        description: 'Breathable linen shirt with a relaxed fit, perfect for layering or wearing alone.',
        category: 'Tops',
        matchScore: '94%',
        image: '/placeholder-tops.jpg'
      },
      {
        name: 'Vintage-Inspired High Waist Jeans',
        price: '65.00',
        description: 'Classic denim with a modern twist, featuring a flattering high waist.',
        category: 'Bottoms',
        matchScore: '91%',
        image: '/placeholder-bottoms.jpg'
      },
      {
        name: 'Minimalist Gold Hoop Earrings',
        price: '28.50',
        description: 'Delicate gold-plated hoops that add a touch of elegance to any outfit.',
        category: 'Accessories',
        matchScore: '89%',
        image: '/placeholder-accessories.jpg'
      },
      {
        name: 'Canvas Structured Tote Bag',
        price: '42.00',
        description: 'Durable canvas tote with clean lines and ample storage space.',
        category: 'Bags',
        matchScore: '88%',
        image: '/placeholder-bags.jpg'
      },
      {
        name: 'Silk Square Neck Camisole',
        price: '38.99',
        description: 'Elegant silk camisole with a modern square neckline.',
        category: 'Tops',
        matchScore: '87%',
        image: '/placeholder-tops.jpg'
      },
      {
        name: 'Woven Leather Slide Sandals',
        price: '55.00',
        description: 'Handcrafted leather slides with a woven pattern and comfort insole.',
        category: 'Shoes',
        matchScore: '86%',
        image: '/placeholder-shoes.jpg'
      }
    ];
  }

  /**
   * Main method to get recommendations for a user
   * @param {string} userId - User ID 
   * @returns {Array} - Personalized product recommendations
   */
  async getRecommendationsForUser(userId) {
    // Get user data from Supabase (commented out for now)
    const userData = await this.getUserData(userId);
    
    // Generate recommendations based on user data
    return await this.generateRecommendations(userData);
  }

  /**
   * Get all relevant user data from Supabase
   * @param {string} userId - User ID
   * @returns {Object} - Compiled user data
   */
  async getUserData(userId) {
    // This would normally fetch from Supabase, but returning mock data for now
    
    // COMMENTED OUT: Supabase queries
    /*
    // Fetch user survey data
    const { data: surveyData } = await supabase
      .from('user_surveys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    // Fetch purchase history
    const { data: purchaseData } = await supabase
      .from('purchases')
      .select('*, reviews(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    // Fetch budget information
    const { data: budgetData } = await supabase
      .from('user_budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    // Process and combine the data
    const userData = {
      stylePreferences: surveyData?.style_preferences || {},
      purchaseHistory: this.processPurchaseHistory(purchaseData),
      budget: {
        weeklyAmount: budgetData?.weekly_amount || 0,
        spentAmount: budgetData?.spent_amount || 0
      },
      reviews: this.extractReviews(purchaseData)
    };
    */
    
    // Mock data for development
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

  /**
   * Process purchase history from Supabase format to simplified format
   * @param {Array} purchaseData - Raw purchase data from Supabase
   * @returns {Array} - Processed purchase history
   */
  processPurchaseHistory(purchaseData) {
    if (!purchaseData || !purchaseData.length) return [];
    
    return purchaseData.map(p => ({
      productName: p.product_name,
      price: p.price,
      category: p.category,
      purchaseDate: p.purchase_date
    }));
  }

  /**
   * Extract reviews from purchase history
   * @param {Array} purchaseData - Raw purchase data with nested reviews
   * @returns {Array} - Processed reviews
   */
  extractReviews(purchaseData) {
    if (!purchaseData || !purchaseData.length) return [];
    
    const reviews = [];
    purchaseData.forEach(purchase => {
      if (purchase.reviews && purchase.reviews.length) {
        purchase.reviews.forEach(review => {
          reviews.push({
            productName: purchase.product_name,
            rating: review.rating,
            likedFeatures: review.liked_aspects,
            dislikedFeatures: review.disliked_aspects,
            comment: review.comment
          });
        });
      }
    });
    
    return reviews;
  }
}

export default new RecommendationService();