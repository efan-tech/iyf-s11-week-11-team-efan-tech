
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitFeedback, getFeedback } from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, Send } from 'lucide-react';

const Feedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: 'Feedback',
    rating: 5,
    message: '',
  });

  // Load public feedback
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFeedback();
        setFeedbacks(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast.error('Please write a message');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitFeedback(form);
      setFeedbacks((prev) => [res.data.feedback, ...prev]);
      setForm({ type: 'Feedback', rating: 5, message: '' });
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050b14]/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold">Feedback & Ideas</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* ========== SUBMIT FORM ========== */}
        <section className="bg-[#0b1329] border border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold text-lg text-white mb-1">Share your thoughts</h2>
          <p className="text-sm text-slate-400 mb-5">
            Help us improve the Community Hub
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Feedback">Feedback</option>
                <option value="Idea">Idea</option>
                <option value="Suggestion">Suggestion</option>
                <option value="Bug">Bug Report</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star })}
                    className="transition"
                  >
                    <Star
                      size={28}
                      className={
                        star <= form.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                Message
              </label>
              <textarea
                rows="4"
                placeholder="What do you think? Any ideas or issues?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-[#050b14] border border-slate-700 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-800 text-slate-950 font-bold py-3.5 rounded-xl transition"
            >
              <Send size={18} />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </section>

        {/* ========== PUBLIC FEED ========== */}
        <section>
          <h3 className="font-bold text-white mb-4">Community Feedback</h3>

          {loading ? (
            <p className="text-slate-500 text-center py-10">Loading...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-slate-500 text-center py-10">
              No feedback yet. Be the first!
            </p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((item) => (
                <div
                  key={item._id}
                  className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.name || item.user?.displayName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {item.type}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Feedback;