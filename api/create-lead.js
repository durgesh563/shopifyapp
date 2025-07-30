import axios from 'axios';

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;

async function getAccessToken() {
  const resp = await axios.post('https://accounts.zoho.in/oauth/v2/token', null, {
    params: {
      refresh_token: ZOHO_REFRESH_TOKEN,
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      grant_type: 'refresh_token'
    }
  });
  return resp.data.access_token;
}

export default async function handler(req, res) {
  // ✅ Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product, sku, image, name, email, message } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email required' });
    }

    const accessToken = await getAccessToken();

    const leadData = {
      Company: 'Shopify Store',
      Last_Name: name,
      Email: email,
      Description: `Requested Quote\nProduct: ${product}\nSKU: ${sku}\nImage: ${image}\nMessage: ${message}`
    };

    const response = await axios.post(
      'https://www.zohoapis.in/crm/v2/Leads',
      { data: [leadData] },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`
        }
      }
    );

    return res.status(200).json({ success: true, zoho: response.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || err.message });
  }
}
