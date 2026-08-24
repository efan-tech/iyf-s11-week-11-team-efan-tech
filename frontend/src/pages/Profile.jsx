import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getProfile,
  updateProfile,
  getGuestbook,
  postGuestbook,
} from '../api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Edit3,
  Send,
  User,
} from 'lucide-react';

const Profile = () => {
  const { identifier } = useParams(); // can be username or userId
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [guestbook, setGuestbook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // posts | guestbook
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '', avatar: '' });
  const [guestbookText, setGuestbookText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwnProfile =
    currentUser &&
    (currentUser.username === identifier ||
      currentUser._id === identifier);

  // ====================== LOAD PROFILE ======================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getProfile(identifier);
        setProfile(res.data.user);
        setStats(res.data.stats);
        setPosts(res.data.posts || []);

        // Load guestbook
        const gbRes = await getGuestbook(res.data.user._id);
        setGuestbook(gbRes.data || []);

        // Pre-fill edit form if own profile
        if (isOwnProfile) {
          setEditForm({
            displayName: res.data.user.displayName || '',
            bio: res.data.user.bio || '',
            avatar: res.data.user.avatar || '',
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (identifier) load();
  }, [identifier]);

  // ====================== UPDATE PROFILE ======================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await updateProfile(editForm);
      setProfile(res.data.user);
      updateUser(res.data.user); // update global auth state
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  // ====================== POST GUESTBOOK ======================
  const handleGuestbook = async (e) => {
    e.preventDefault();
    if (!guestbookText.trim()) return;

    setSubmitting(true);
    try {
      const res = await postGuestbook(profile._id, guestbookText.trim());
      setGuestbook((prev) => [res.data, ...prev]);
      setGuestbookText('');
      toast.success('Message posted!');
    } catch (err) {
      toast.error('Failed to post message');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center text-sky-400">
        Loading profile...
      </div>
    );
  }

  if (!profile) return null;

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
          <span className="font-bold">{profile.displayName}</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* ========== PROFILE CARD ========== */}
        <section className="bg-[#0b1329] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-5">
            <img
              src={profile.avatar}
              alt={profile.displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-sky-500/50"
            />

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {profile.displayName}
                  </h1>
                  <p className="text-sky-400 text-sm">@{profile.username}</p>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setEditing(!editing)}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                )}
              </div>

              {profile.bio && (
                <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-5 mt-4 text-sm">
                <div>
                  <span className="font-bold text-white">{stats?.totalPosts || 0}</span>
                  <span className="text-slate-400 ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-white">{stats?.totalLikes || 0}</span>
                  <span className="text-slate-400 ml-1">Likes</span>
                </div>
                <div>
                  <span className="font-bold text-white">{stats?.totalRsvps || 0}</span>
                  <span className="text-slate-400 ml-1">RSVPs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editing && isOwnProfile && (
            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-3 border-t border-slate-800 pt-5">
              <input
                type="text"
                placeholder="Display Name"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
              />
              <textarea
                rows="3"
                placeholder="Bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full bg-[#050b14] border border-slate-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-sky-500 resize-none"
              />
              <input
                type="text"
                placeholder="Avatar URL"
                value={editForm.avatar}
                onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                className="w-full bg-[#050b14] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl transition"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-5 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ========== TABS ========== */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              activeTab === 'posts'
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('guestbook')}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              activeTab === 'guestbook'
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guestbook ({guestbook.length})
          </button>
        </div>

        {/* ========== POSTS TAB ========== */}
        {activeTab === 'posts' && (
          <section className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No posts yet</p>
            ) : (
              posts.map((post) => (
                <article
                  key={post._id}
                  className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5"
                >
                  <h3 className="font-bold text-white">{post.title}</h3>
                  <p className="text-sm text-slate-300 mt-2 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Heart size={14} /> {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} /> {post.comments?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 size={14} /> {post.shares || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {post.date}
                    </span>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {/* ========== GUESTBOOK TAB ========== */}
        {activeTab === 'guestbook' && (
          <section className="space-y-4">
            {/* Leave a message (only if not own profile) */}
            {!isOwnProfile && (
              <form onSubmit={handleGuestbook} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Leave a message on their profile..."
                  value={guestbookText}
                  onChange={(e) => setGuestbookText(e.target.value)}
                  className="flex-1 bg-[#0b1329] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 p-3 rounded-xl transition"
                >
                  <Send size={18} />
                </button>
              </form>
            )}

            {guestbook.length === 0 ? (
              <p className="text-center text-slate-500 py-10">
                No messages yet. Be the first!
              </p>
            ) : (
              guestbook.map((item) => (
                <div
                  key={item._id}
                  className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4 flex gap-3"
                >
                  <img
                    src={item.author?.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sky-400 text-sm">
                        {item.author?.displayName}
                      </span>
                      <span className="text-xs text-slate-500">
                        @{item.author?.username}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{item.text}</p>
                    <p className="text-xs text-slate-600 mt-2">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Profile;