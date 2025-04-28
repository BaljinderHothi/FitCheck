import supabase from '../../../utils/supabase/config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const { data: session, error } = await supabase.auth.getSession();

    if (error || !session) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    return res.status(200).json({ message: 'User validated successfully', session });
    
  } catch (err) {

    console.error('Error validating user session:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
