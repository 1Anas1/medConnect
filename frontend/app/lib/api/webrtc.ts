// lib/api/webrtc.ts
import axios from 'axios';
import { getApiBaseUrl } from '../../lib/networkUtils';

const API_BASE_URL = getApiBaseUrl();

export const sendSignal = async (appointmentId: string, signal: any, token: string) => {
  try {
    await axios.post(`${API_BASE_URL}/api/video/session/${appointmentId}/signal`, signal, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('[sendSignal] Error sending signal:', error);
  }
};

export const fetchSignals = async (appointmentId: string, sinceTimestamp: number, token: string) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/video/session/${appointmentId}/signal?since=${sinceTimestamp}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('[fetchSignals] Error fetching signals:', error);
    return [];
  }
};
