
import axios from 'axios';
const headers = {
  'User-Agent': 'TxApp-Testing/1.0',
  'X-API-Key': 'TxApp-API-Key-2025',
  'X-Requested-With': 'XMLHttpRequest',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache'
};
try {
  const response = await axios.get('https://api.txapp.be/api/health', { headers, timeout: 10000 });
  console.log('✅ Health check:', response.data);
} catch (error) {
  console.log('❌ Health check error:', error.response?.status, error.message);
}

