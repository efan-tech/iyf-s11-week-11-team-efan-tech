import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default API;

// Helper functions (keep these)
export const fetchEvents = () => API.get('/events');
export const createEvent = (eventData) => API.post('/events', eventData);
export const rsvpToEvent = (eventId, data) => API.post(`/events/${eventId}/rsvp`, data);