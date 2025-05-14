import supabase from '../../../utils/supabase/config';

export default async function handler(req, res) {
  console.log('🔄 Request method:', req.method);
  console.log('📩 Request body:', req.body);

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
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('⚠️ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔐 Signing in with:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('❌ Supabase Error:', error.message);
      return res.status(400).json({ error: error.message || 'Invalid login credentials' });
    }

    if (!data.user || !data.session) {
      console.warn('⚠️ Missing user or session');
      return res.status(400).json({ error: 'User not found or session missing' });
    }

    const emailVerified = data.user?.user_metadata?.email_verified ?? false;
    if (!emailVerified) {
      return res.status(200).json({
        message: 'Please Verify Your Email',
        user: data.user,
      });
    }

    return res.status(200).json({
      message: 'Login Successful',
      user: data.user,
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
    });

  } catch (err) {
    console.error('🔥 Internal Server Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
