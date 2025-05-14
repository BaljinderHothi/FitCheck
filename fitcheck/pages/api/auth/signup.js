import supabase from '../../../utils/supabase/config';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, password, gender, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          gender,
          email_verified: false,
        },
      },
    });

    if (authError) {
      console.error('Auth error:', authError.message);
      return res.status(400).json({ error: authError.message });
    }

    const user = data?.user;
    if (!user) {
      return res.status(500).json({ error: 'Signup succeeded but user object is missing.' });
    }

    const { error: dbError } = await supabase.from('users').insert({
      id: user.id,
      email,
      first_name,
      last_name,
      gender,
    });

    if (dbError) {
      console.error('Database insert error:', dbError.message);
      return res.status(400).json({ error: dbError.message });
    }

    return res.status(200).json({ message: 'Please verify your email' });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
