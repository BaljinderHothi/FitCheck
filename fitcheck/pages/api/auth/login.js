import supabase from '../../../utils/supabase/config';

export default async function handler(req, res) {
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Attempting to sign in with:', { email, password });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    if (!data.user) {
      console.log('User not found or incorrect credentials');
      return res.status(400).json({ error: 'User not found or incorrect credentials' });
    }

    if (data.user && !data.user.user_metadata.email_verified) {
      return res.status(200).json({
        message: 'Please Verify Your Email',
        user: data.user,
      });
    }

    return res.status(200).json({
      message: 'Login Successful',
      user: data.user,
    });
  } catch (err) {
    console.error('Internal Server Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}