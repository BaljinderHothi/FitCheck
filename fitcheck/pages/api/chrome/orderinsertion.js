import supabase from '../../../utils/supabase/config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    let { order_number, item_name, order_date, total} = req.body;

    if (!order_number || !item_name || !order_date || !total || !unique) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const parsedDate = new Date(order_date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid order_date format' });
    }
    const timestamp = parsedDate.toISOString(); 

    const numericTotal = parseFloat(total.replace(/[^0-9.]/g, ''));
    if (isNaN(numericTotal)) {
      return res.status(400).json({ error: 'Invalid total format' });
    }
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          order_number,
          item_name,
          order_date: timestamp,
          total: numericTotal
        }
      ]);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error inserting order' });
    }

    return res.status(200).json({ message: 'Order inserted successfully', data });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
