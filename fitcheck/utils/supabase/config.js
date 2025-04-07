// config.js
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjiffhiwrribosabsaus.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

