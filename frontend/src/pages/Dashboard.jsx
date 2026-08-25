 import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  fetchEvents,
  createEvent,
  rsvpToEvent,
  likeEvent,
  commentOnEvent,
  shareEvent,
} from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  MapPin,
  LogOut,
  Plus,
  Send,
} from 'lucide-react';

const categoryColors = {
  Arts: 'bg-purple-600/90 text-purple-100',
  'Praise & Worship': 'bg-rose-600/90 text-rose-100',
  'Tech & Innovation': 'bg-sky-600/90 text-sky-100',
  Sports: 'bg-emerald-600/90 text-emerald-100',
  Hackathons: 'bg-indigo-600/90 text-indigo-100',
  Cultural: 'bg-pink-600/90 text-pink-100',
  General: 'bg-slate-600/90 text-slate-100',
  'Catholic / Faith': 'bg-amber-600/90 text-amber-100',
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'General',
    location: '',
    date: '',
    image: '',
    description: '',
  });

  // ====================== LOAD EVENTS ======================
  const loadEvents = async () => {
    try {
      const res = await fetchEvents();
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // ====================== REAL-TIME LISTENERS ======================
  useEffect(() => {
    if (!socket) return;

    socket.on('newPost', (newEvent) => {
      setEvents((prev) => [newEvent, ...prev]);
      toast.success('New event posted!');
    });

    socket.on('rsvpUpdated', (updatedEvent) => {
      setEvents((prev) =>
        prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev))
      );
    });

    socket.on('postLiked', (updatedEvent) => {
      setEvents((prev) =>
        prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev))
      );
    });

    socket.on('newComment', (updatedEvent) => {
      setEvents((prev) =>
        prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev))
      );
    });

    socket.on('postShared', (updatedEvent) => {
      setEvents((prev) =>
        prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev))
      );
    });

    socket.on('postDeleted', (deletedId) => {
      setEvents((prev) => prev.filter((ev) => ev._id !== deletedId));
    });

    return () => {
      socket.off('newPost');
      socket.off('rsvpUpdated');
      socket.off('postLiked');
      socket.off('newComment');
      socket.off('postShared');
      socket.off('postDeleted');
    };
  }, [socket]);

  // ====================== CREATE EVENT ======================
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setSubmitting(true);
    try {
      await createEvent({
        ...form,
        location: form.location || 'Campus',
        date: form.date || 'TBA',
      });

      setForm({
        title: '',
        category: 'General',
        location: '',
        date: '',
        image: '',
        description: '',
      });
      setShowCreate(false);
      toast.success('Event created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  // ====================== RSVP ======================
  const handleRsvp = async (eventId, status) => {
    try {
      await rsvpToEvent(eventId, status);
      toast.success(`You marked as ${status}`);
    } catch (err) {
      toast.error('Failed to RSVP');
    }
  };

  // ====================== LIKE ======================
  const handleLike = async (eventId) => {
    try {
      await likeEvent(eventId);
    } catch (err) {
      toast.error('Failed to like');
    }
  };

  // ====================== COMMENT ======================
  const handleComment = async (eventId) => {
    const text = commentInputs[eventId];
    if (!text?.trim()) return;

    try {
      await commentOnEvent(eventId, text.trim());
      setCommentInputs((prev) => ({ ...prev, [eventId]: '' }));
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to comment');
    }
  };

  // ====================== SHARE ======================
  const handleShare = async (eventId) => {
    try {
      await shareEvent(eventId);
      const url = `\( {window.location.origin}/event/ \){eventId}`;
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch (err) {
      toast.error('Failed to share');
    }
  };

  // ====================== HELPERS ======================
  const getUserRsvp = (event) => {
    return event.rsvps?.find(
      (r) => r.user?._id === user?._id || r.user === user?._id
    );
  };

  const hasLiked = (event) => {
    return event.likes?.some(
      (like) => like._id === user?._id || like === user?._id
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center text-sky-400">
        Loading Community Hub...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-100">
      {/* ========== HEADER ========== */}
<header className="sticky top-0 z-30 bg-[#050b14]/90 backdrop-blur border-b border-slate-800 md:border-none">
  <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
    <h1 className="font-bold text-white text-lg hidden md:block">
      Niko on Events
    </h1>

    <button
      onClick={() => setShowCreate(!showCreate)}
      className="flex items-center gap-1.5 text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-3 py-2 rounded-lg transition ml-auto"
    >
      <Plus size={16} />
      New Event
    </button>
  </div>
</header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* ========== CREATE EVENT FORM ========== */}
        {showCreate && (
          <section className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-sky-400" />
              Create New Event
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <input
                type="text"
                placeholder="Event title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="bg-[#050b14] border border-slate-700 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="General">General</option>
                  <option value="Arts">Arts</option>
                  <option value="Praise & Worship">Praise & Worship</option>
                  <option value="Tech & Innovation">Tech & Innovation</option>
                  <option value="Sports">Sports</option>
                  <option value="Hackathons">Hackathons</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Catholic / Faith">Catholic / Faith</option>
                </select>

                <input
                  type="text"
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="bg-[#050b14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Date / Time (e.g. Sat 3pm)"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-[#050b14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="bg-[#050b14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <textarea
                rows="3"
                placeholder="What should people know about this event?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[#050b14] border border-slate-700 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                required
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800 text-slate-950 font-bold py-3 rounded-xl transition"
                >
                  {submitting ? 'Creating...' : 'Publish Event'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ========== EVENTS FEED ========== */}
        <section className="space-y-5">
          <h2 className="font-bold text-white text-lg">Niko on Events</h2>

          {events.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📅</div>
              <p className="text-slate-400">No events yet. Be the first to create one!</p>
            </div>
          )}

          {events.map((event) => {
            const userRsvp = getUserRsvp(event);
            const liked = hasLiked(event);
            const goingCount = event.rsvps?.filter((r) => r.status === 'going').length || 0;
            const maybeCount = event.rsvps?.filter((r) => r.status === 'maybe').length || 0;

            return (
              <article
                key={event._id}
                className="bg-[#0b1329] border border-slate-800 rounded-2xl overflow-hidden"
              >
                {event.image && (
                  <div className="relative h-48 bg-slate-900">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md ${
                        categoryColors[event.category] || categoryColors.General
                      }`}
                    >
                      {event.category}
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4 text-xs text-sky-400/90">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {event.date || 'TBA'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {event.location || 'Campus'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-white leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <img
                      src={event.author?.avatar}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    Hosted by{' '}
                    <span className="text-slate-300 font-medium">
                      {event.author?.displayName || event.author?.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="text-emerald-400 font-medium">
                      {goingCount} going
                    </span>
                    {maybeCount > 0 && <span>• {maybeCount} maybe</span>}
                    <span>• {event.likes?.length || 0} likes</span>
                    <span>• {event.comments?.length || 0} comments</span>
                    {event.shares > 0 && <span>• {event.shares} shares</span>}
                  </div>

                  {/* RSVP Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {['going', 'maybe', 'not-going'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleRsvp(event._id, status)}
                        className={`py-2.5 rounded-xl text-xs font-semibold transition ${
                          userRsvp?.status === status
                            ? status === 'going'
                              ? 'bg-emerald-600 text-white'
                              : status === 'maybe'
                              ? 'bg-amber-600 text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {status === 'going'
                          ? 'Going'
                          : status === 'maybe'
                          ? 'Maybe'
                          : 'Not Going'}
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-1 border-t border-slate-800">
                    <button
                      onClick={() => handleLike(event._id)}
                      className={`flex items-center gap-1.5 text-sm transition ${
                        liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
                      }`}
                    >
                      <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                      {event.likes?.length || 0}
                    </button>

                    <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-sky-400 transition">
                      <MessageCircle size={18} />
                      {event.comments?.length || 0}
                    </button>

                    <button
                      onClick={() => handleShare(event._id)}
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition"
                    >
                      <Share2 size={18} />
                      Share
                    </button>
                  </div>

                  {/* Comments */}
                  {event.comments?.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {event.comments.slice(-3).map((comment) => (
                        <div key={comment._id} className="flex gap-2.5">
                          <img
                            src={comment.user?.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="bg-slate-900/60 rounded-xl px-3 py-2 text-sm flex-1">
                            <span className="font-semibold text-sky-400 text-xs">
                              {comment.user?.displayName || comment.user?.username}
                            </span>
                            <p className="text-slate-300 mt-0.5">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[event._id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [event._id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleComment(event._id);
                      }}
                      className="flex-1 bg-[#050b14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={() => handleComment(event._id)}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 p-2.5 rounded-xl transition"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;