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

  try {
    const token = authHeader.split('Bearer ')[1];
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      console.error('Auth error:', userError?.message || 'No user data');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const email = userData.user.email;

    const { data: userRow, error: userLookupError } = await supabase
      .from('users')
      .select('userid')
      .eq('email', email)
      .single();

    if (userLookupError || !userRow) {
      console.error('User lookup failed:', userLookupError?.message || 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const { data: sentimentData, error: sentimentError } = await supabase
      .from('sentiment')
      .select('*')
      .eq('userid', userRow.userid)
      .order('created_at', { ascending: false });

    if (sentimentError) {
      console.error('Sentiment fetch error:', sentimentError.message);
      return res.status(500).json({ error: 'Failed to fetch sentiment data' });
    }

    const reviews = sentimentData.map(item => ({
      productName: item.product_name,
      rating: item.star_rating,
      likedFeatures: item.sentiment_label === 'positive' ? 'style, comfort' : '',
      dislikedFeatures: item.sentiment_label === 'negative' ? 'fit, quality' : '',
      comment: item.review_text
    }));

    const userPayload = {
      reviews: reviews.slice(0, 3),
      stylePreferences: {},
      purchaseHistory: [],
      budget: { weeklyAmount: 100, spentAmount: 0 }
    };

    const recommendations = await recommendationService.generateRecommendations(userPayload);
    return res.status(200).json({ recommendations });

  } catch (err) {
    console.error('Unexpected server error in getReviews:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
