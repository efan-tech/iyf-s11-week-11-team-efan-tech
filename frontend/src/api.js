import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Automatically attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle 401 globally (auto logout)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optional: redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

// Helper functions
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

export const fetchEvents = () => API.get('/events');
export const createEvent = (data) => API.post('/events', data);
export const rsvpToEvent = (eventId, status) => API.post(`/events/${eventId}/rsvp`, { status });
export const likeEvent = (eventId) => API.post(`/events/${eventId}/like`);
export const commentOnEvent = (eventId, text, parentComment = null) =>
  API.post(`/events/${eventId}/comments`, { text, parentComment });
export const shareEvent = (eventId) => API.post(`/events/${eventId}/share`);

export const getProfile = (identifier) => API.get(`/profile/${identifier}`);
export const updateProfile = (data) => API.put('/profile/me', data);
export const getGuestbook = (userId) => API.get(`/profile/${userId}/guestbook`);
export const postGuestbook = (userId, text) => API.post(`/profile/${userId}/guestbook`, { text });

export const submitFeedback = (data) => API.post('/feedback', data);
export const getFeedback = () => API.get('/feedback');