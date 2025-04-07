import supabase from '../../../utils/supabase/config';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    try {
        const { error } = await supabase.auth.signOut();
    
        if (error) {
        return res.status(400).json({ error: error.message });
        }
    
        return res.status(200).json({ message: 'Logout Successful' });
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    }