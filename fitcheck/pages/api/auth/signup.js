import supabase from '../../../utils/supabase/config';

export default async function handler(req, res) {
  // ✅ Set CORS headers
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password, gender, first_name, last_name } = req.body;

    // ✅ Validate required fields
    if (!email || !password || !first_name || !last_name || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // ✅ Sign up user via Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email_verified: false,
          first_name,
          last_name,
          gender,
        }
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return res.status(400).json({ error: `Authentication error: ${authError.message}` });
    }

    const user = data?.user;
    if (!user) {
      return res.status(400).json({ error: 'User creation failed' });
    }

    // ✅ Insert user profile data into 'users' table
    const { error: dbError } = await supabase.from('users').insert({
      id: user.id,
      email,
      first_name,
      last_name,
      gender,
    });

    if (dbError) {
      console.error('❌ DB error:', dbError.message);
      return res.status(400).json({ error: dbError.message });
    }

    return res.status(200).json({ message: 'Please verify your email' });

  } catch (err) {
    console.error('🔥 Internal Server Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
