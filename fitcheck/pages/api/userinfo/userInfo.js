import supabase from '../../../utils/supabase/config';
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET supported' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader||!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError||!userData?.user?.email) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const email = userData.user.email;
  const { data: userRow, error: userLookupError } = await supabase
    .from('users')
    .select('userid, email, gender, first_name, last_name')
    .eq('email', email)
    .single();

  if (userLookupError || !userRow) {
    return res.status(404).json({ error: 'User not found in users table' });
  }
  const { data: reviews, error: reviewError } = await supabase
    .from('sentiment')
    .select('id, created_at, star_rating, review_text, sentiment_label, sentiment_score, worth_it, product_name, meta')
    .eq('userid', userRow.userid)
    .order('created_at', { ascending: false });

  if (reviewError) {
    return res.status(500).json({ error: 'Failed to fetch user reviews' });
  }

  return res.status(200).json({
    user: userRow,
    reviews: reviews || []
  });
}
