import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'X-Tenant-Id': process.env.NEXT_PUBLIC_TENANT_ID || 'kigali-city-mall',
    'Content-Type': 'application/json',
  },
});

export default apiClient;
