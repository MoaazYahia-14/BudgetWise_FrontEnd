import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const INDUSTRIES = [
  { value: 'all',            label: 'All' },
  { value: 'technology',     label: 'Technology' },
  { value: 'food',           label: 'Food & Beverage' },
  { value: 'tourism',        label: 'Tourism & Hospitality' },
  { value: 'healthcare',     label: 'Healthcare & Wellness' },
  { value: 'education',      label: 'Education & Training' },
  { value: 'retail',         label: 'Retail & E-commerce' },
  { value: 'entertainment',  label: 'Entertainment & Media' },
  { value: 'sports',         label: 'Sports & Fitness' },
  { value: 'finance',        label: 'Finance & Banking' },
  { value: 'manufacturing',  label: 'Manufacturing' },
  { value: 'other',          label: 'Other' },
];
const PAGE_SIZE = 6;
const FALLBACK = 'https://images.unsplash.com/photo-1664494130837-14e0473ed284?auto=format&fit=crop&q=80&w=2670';

const FounderHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/activities');
        setPosts(res.data?.data?.activities || []);
      } catch (err) {
        console.error('Failed to fetch founder posts feed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const filtered = posts
    .filter(p => {
      if (industry === 'all') return true;
      const val = (p.industry || p.category || '').toLowerCase();
      return val === industry;
    })
    .filter(p => {
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        (p.industry || p.category || '').toLowerCase().includes(q)
      );
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleIndustry = (val) => { setIndustry(val); setPage(1); };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
          {t('founderCommunity', 'Founder Community')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          {t('discoverPosts', 'Discover activities published by other founders.')}
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
        <input
          type="text"
          placeholder={t('searchPosts', 'Search by title, description or location...')}
          value={search}
          onChange={handleSearch}
          style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box', transition: '0.2s' }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {INDUSTRIES.map(ind => (
            <button
              key={ind.value}
              onClick={() => handleIndustry(ind.value)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: '0.2s',
                border: industry === ind.value ? 'none' : '1px solid var(--border)',
                background: industry === ind.value ? 'var(--primary)' : 'var(--card-bg)',
                color: industry === ind.value ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          {filtered.length} {t('postsFound', 'posts found')}
        </p>
      )}

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>{t('loading', 'Loading...')}</div>
      ) : paginated.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>{t('noPostsAvailable', 'No posts match your search.')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {paginated.map(post => {
            const authorName = post.founder?.companyName || post.founder?.name || 'Founder';
            const authorAvatar = post.founder?.avatar
              ? getImageUrl(post.founder.avatar)
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=6C63FF&color=fff`;

            return (
              <div key={post._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s' }}>
                {/* Author */}
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)' }}>
                  <img src={authorAvatar} alt={authorName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>{authorName}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(post.createdAt)}</span>
                  </div>
                  {post.industry || post.category ? (
                    <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                      {(post.industry || post.category) === 'other' && post.customCategory 
                        ? `Other - ${post.customCategory}` 
                        : (INDUSTRIES.find(i => i.value === (post.industry || post.category))?.label || (post.industry || post.category))}
                    </span>
                  ) : null}
                </div>
                {/* Content */}
                <div style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <img src={getImageUrl(post.image) || getImageUrl(post.images?.[0]) || FALLBACK} alt={post.title} style={{ width: '180px', height: '130px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.src = FALLBACK; }} />
                  <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '18px', margin: '0 0 8px', color: 'var(--text-main)' }}>{post.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.description || t('noDescriptionAvailable', 'No description available.')}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      <span>📍 {post.location || post.city || 'N/A'}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>💰 {post.price} {t('egp', 'EGP')}</span>
                      {post.rating > 0 && <span>⭐ {post.rating}</span>}
                    </div>
                    <button
                      onClick={() => navigate(`/founder/post/${post._id}`, { state: { activity: post } })}
                      style={{ marginTop: 'auto', alignSelf: 'flex-start', background: 'rgba(108,99,255,0.1)', color: 'var(--primary)', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: '0.2s', fontSize: '13px' }}
                    >
                      {t('viewDetails', 'View Details')} →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-main)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
            ← {t('prev', 'Prev')}
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: page === i + 1 ? 'none' : '1px solid var(--border)',
                background: page === i + 1 ? 'var(--primary)' : 'var(--card-bg)',
                color: page === i + 1 ? '#fff' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-main)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>
            {t('next', 'Next')} →
          </button>
        </div>
      )}
    </div>
  );
};

export default FounderHome;
