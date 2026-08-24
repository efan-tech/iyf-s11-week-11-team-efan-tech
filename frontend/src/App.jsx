
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import API from './api';
import Dashboard from './pages/Dashboard';
import Feedback from './pages/Feedback';
import Auth from './pages/Auth';   // ← using the new combined page

// Renders Dashboard OR the Feedback modal; owns the events list & current user.
function Shell() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ql_user');
    return saved
      ? JSON.parse(saved)
      : { username: 'Nahashon', handle: '@nahashon_tech', status: 'Active' };
  });

  const loadEvents = async () => {
    try {
      const res = await API.get('/events');
      setEvents(res.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleAddEvent = async (newEventData) => {
    try {
      const res = await API.post('/events', {
        ...newEventData,
        author: {
          name: currentUser.username || 'Anonymous',
          handle: currentUser.handle || '',
          avatar: currentUser.avatar || '',
        },
      });
      setEvents([res.data, ...events]);
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleRsvp = async (eventId, status) => {
    try {
      const res = await API.post(`/events/${eventId}/rsvp`, {
        name: currentUser.username || 'Anonymous',
        status: status,
      });
      setEvents((prev) =>
        prev.map((ev) => (ev._id === eventId ? res.data : ev))
      );
    } catch (err) {
      console.error('RSVP error:', err);
      alert('Failed to RSVP. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center text-sky-400 font-semibold">
        Loading Niko on…
      </div>
    );
  }

  if (showFeedback) {
    return (
      <div className="min-h-screen bg-[#050b14] text-gray-100 p-4 max-w-md mx-auto">
        <button
          onClick={() => setShowFeedback(false)}
          className="mb-4 text-sky-400 text-sm font-semibold hover:underline"
        >
          ← Back to Campus Feed
        </button>
        <Feedback />
      </div>
    );
  }

  return (
    <Dashboard
      events={events}
      onAddEvent={handleAddEvent}
      onRsvp={handleRsvp}
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      setShowFeedback={setShowFeedback}
    />
  );
}

// Optional guard — drop in if you want /dashboard to demand a token.
function RequireToken({ children }) {
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Both /login and /register now use the combined Auth page */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />

      <Route
        path="/dashboard"
        element={
          <RequireToken>
            <Shell />
          </RequireToken>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;