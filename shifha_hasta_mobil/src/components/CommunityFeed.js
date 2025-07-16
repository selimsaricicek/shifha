import React, { useState } from 'react';

const branches = [
  'Dahiliye',
  'Kardiyoloji',
  'Göz',
  'Cildiye',
  'Ortopedi',
];
const doctors = {
  'Dahiliye': ['Dr. Ayşe Yılmaz', 'Dr. Mehmet Kaya'],
  'Kardiyoloji': ['Dr. Elif Demir', 'Dr. Ahmet Şahin'],
  'Göz': ['Dr. Zeynep Aksoy'],
  'Cildiye': ['Dr. Burak Can'],
  'Ortopedi': ['Dr. Selin Korkmaz'],
};

const initialPosts = [
  {
    id: 1,
    user: {
      name: 'tuneim',
      avatar: 'https://ui-avatars.com/api/?name=T+I',
    },
    time: '2 saat önce',
    text: 'İyi akşamlar🙌 bugün gece kahvaltısı oldu🐣🍳🔍',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    likes: 123,
    comments: [
      { id: 1, user: 'ayse', text: 'Çok güzel görünüyor!' }
    ],
    saved: false,
  },
  {
    id: 2,
    user: {
      name: 'Hivru@',
      avatar: 'https://ui-avatars.com/api/?name=H+@',
    },
    time: '2 saat önce',
    text: 'Bu akşam böyle olsun kapanış 💜🙌',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    likes: 88,
    comments: [],
    saved: false,
  },
  {
    id: 3,
    user: {
      name: 'Dr.Ahsen',
      avatar: 'https://ui-avatars.com/api/?name=Dr+Ahsen',
    },
    time: '4 gün önce',
    text: 'Herkese mutlu huzurlu bir pazar günü dilerim... bağırsak sağlığı için yaşasın fasulye 😊😊',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=800&q=80',
    likes: 57,
    comments: [
      { id: 2, user: 'mehmet', text: 'Fasulye candır!' }
    ],
    saved: false,
  },
];

const CommunityFeed = () => {
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState({ text: '', image: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [followed, setFollowed] = useState([]);
  // Randevu state
  const [appointment, setAppointment] = useState({ branch: '', doctor: '', date: '', time: '' });
  const [appointments, setAppointments] = useState([]);

  const handleLike = (postId) => {
    setPosts(posts => posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + (post.liked ? -1 : 1), liked: !post.liked }
        : post
    ));
  };

  const handleFollow = (userName) => {
    setFollowed((prev) => prev.includes(userName) ? prev : [...prev, userName]);
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setPosts(posts => posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, { id: Date.now(), user: 'Sen', text }] }
        : post
    ));
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost((prev) => ({ ...prev, image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setNewPost((prev) => ({ ...prev, image: '' }));
      setImagePreview('');
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    const text = newPost.text.trim();
    if (!text) return;
    setPosts([
      {
        id: Date.now(),
        user: { name: 'Sen', avatar: 'https://ui-avatars.com/api/?name=Sen' },
        time: 'şimdi',
        text,
        image: newPost.image.trim() || '',
        likes: 0,
        comments: [],
        saved: false,
      },
      ...posts,
    ]);
    setNewPost({ text: '', image: '' });
    setImagePreview('');
  };

  return (
    <div className="w-full max-w-md mx-auto pt-4 pb-24 px-2">
      {/* Gönderi Oluştur */}
      <form onSubmit={handleCreatePost} className="bg-white rounded-2xl shadow mb-6 p-4 border border-gray-100 flex flex-col gap-2">
        <textarea
          name="text"
          value={newPost.text}
          onChange={handleNewPostChange}
          placeholder="Ne paylaşmak istersin?"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
          rows={2}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full text-xs"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Seçilen görsel" className="w-full object-cover rounded-xl mb-2 max-h-40" />
        )}
        <button type="submit" className="self-end bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-lg text-sm font-semibold shadow hover:from-cyan-600 hover:to-blue-600 transition">Gönderi Oluştur</button>
      </form>
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-2xl shadow-md mb-6 p-5">
          <div className="flex items-center mb-2 justify-between">
            <div className="flex items-center">
              <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full mr-3 border" />
              <div>
                <div className="font-semibold text-gray-900 text-sm leading-tight">{post.user.name}</div>
                <div className="text-xs text-gray-400">{post.time}</div>
              </div>
            </div>
            {post.user.name !== 'Sen' && (
              <button
                onClick={() => handleFollow(post.user.name)}
                disabled={followed.includes(post.user.name)}
                className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold border transition ${followed.includes(post.user.name) ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-default' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400 hover:from-cyan-600 hover:to-blue-600'}`}
              >
                {followed.includes(post.user.name) ? 'Takiptesin' : 'Takip Et'}
              </button>
            )}
          </div>
          <div className="text-gray-700 text-sm mb-3 leading-snug">
            {post.text}
          </div>
          {post.image && (
            <img src={post.image} alt="post" className="w-full object-cover rounded-xl mb-3 max-h-60" />
          )}
          <div className="flex items-center gap-6 text-gray-500 text-sm mt-2">
            <button className={`flex items-center gap-1 ${post.liked ? 'text-pink-600' : 'hover:text-pink-500'}`} onClick={() => handleLike(post.id)}>
              <svg className="w-5 h-5" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
              <span>{post.likes}</span>
            </button>
            <div className="flex items-center gap-1">
              {/* Klasik sohbet baloncuğu (yorum) ikonu */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{post.comments.length}</span>
            </div>
          </div>
          <div className="pt-2">
            <ul className="mb-2 space-y-1">
              {post.comments.map(c => (
                <li key={c.id} className="text-xs text-gray-700"><span className="font-semibold text-cyan-700">{c.user}:</span> {c.text}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={commentInputs[post.id] || ''}
                onChange={e => handleCommentChange(post.id, e.target.value)}
                placeholder="Yorum yaz..."
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id); }}
              />
              <button onClick={() => handleAddComment(post.id)} className="text-cyan-600 text-xs font-semibold hover:text-cyan-800">Gönder</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityFeed;