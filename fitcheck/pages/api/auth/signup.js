import supabase from '../../../utils/supabase/config';

export async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, gender, first_name, last_name } = req.body;
    const { user, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      return res.status(400).json({
        error: `Authentication error: ${authError.message}`,
      });
    }
    const { error: dbError } = await supabase.from('users').insert({
      first_name,
      last_name,
      email,
      gender,
    });
    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }
    return res.status(200).json({ message: 'Please verify your email' });
  }

  res.status(405).json({ message: 'Method Not Allowed' });
}

export default handler;

