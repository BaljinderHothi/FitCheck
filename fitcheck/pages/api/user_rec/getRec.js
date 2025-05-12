// fitcheck/pages/api/user_reviews/getReviews.js
import supabase from '../../../utils/supabase/config';
import recommendationService from '../../../utils/supabase/recommendationService';



export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET supported' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const email = userData.user.email;

  // Get user ID from 'users' table
  const { data: userRow, error: userLookupError } = await supabase
    .from('users')
    .select('userid')
    .eq('email', email)
    .single();

  if (userLookupError || !userRow) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get sentiment reviews
  const { data: sentimentData, error: sentimentError } = await supabase
    .from('sentiment')
    .select('*')
    .eq('userid', userRow.userid)
    .order('created_at', { ascending: false });

  if (sentimentError) {
    return res.status(500).json({ error: 'Failed to fetch sentiment data' });
  }

  // Transform reviews into Gemini-compatible format
  const reviews = sentimentData.map(item => ({
    productName: item.product_name,
    rating: item.star_rating,
    likedFeatures: item.sentiment_label === 'positive' ? 'style, comfort' : '',
    dislikedFeatures: item.sentiment_label === 'negative' ? 'fit, quality' : '',
    comment: item.review_text
  }));

  const userPayload = {
    reviews: reviews.slice(0, 3),  // ✅ limit to 3 to avoid token limit
    stylePreferences: {},
    purchaseHistory: [],
    budget: { weeklyAmount: 100, spentAmount: 0 }
  };

  const recommendations = await recommendationService.generateRecommendations(userPayload);
  return res.status(200).json({ recommendations });
}
