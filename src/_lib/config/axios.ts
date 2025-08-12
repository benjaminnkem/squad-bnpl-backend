import axios from 'axios';

export const squadApi = axios.create({
  baseURL: 'https://sandbox-api-d.squadco.com',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.SQUAD_SECRET_KEY}`,
  },
});
