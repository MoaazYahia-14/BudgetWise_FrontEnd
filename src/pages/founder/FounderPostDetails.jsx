import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/founder/FounderPostDetails.css';
import '../../styles/pages/founder/FounderPosts.css';

/* Icons */
const LocationIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const ClockIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const StarIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const TargetIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>);
const MoneyIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>);
const CalendarIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const EditIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>);
const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
const BackIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const DangerIcon = () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);

const FALLBACK = 'https://images.unsplash.com/photo-1664494130837-14e0473ed284?auto=format&fit=crop&q=80&w=2670';

const FounderPostDetails = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activity, setActivity] = useState(location.state?.activity || null);
  const [loading, setLoading] = useState(!location.state?.activity);
  const [activeImage, setActiveImage] = useState('');

  /* ── Edit Modal ── */
  const [showEdit, setShowEdit] = useState(false);
  const [closingEdit, setClosingEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editImages, setEditImages] = useState({ main: null, gallery1: null, gallery2: null, gallery3: null });
  const [editPreviews, setEditPreviews] = useState({ main: '', gallery1: '', gallery2: '', gallery3: '' });
  const [isSaving, setIsSaving] = useState(false);
  const editRefs = { main: useRef(null), gallery1: useRef(null), gallery2: useRef(null), gallery3: useRef(null) };

  /* ── Delete Modal ── */
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ── Fetch ── */
  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/activities/${id}`);
      const data = res.data?.data || res.data;
      setActivity(data);
      setActiveImage(getImageUrl(data?.image) || getImageUrl(data?.images?.[0]) || FALLBACK);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!activity) fetchActivity();
    else setActiveImage(getImageUrl(activity.image) || getImageUrl(activity.images?.[0]) || FALLBACK);
  }, [id]);

  /* ── Edit handlers ── */
  const openEdit = () => {
    setEditForm({
      title: activity.title || '',
      location: activity.location || '',
      duration: activity.duration || '',
      price: activity.price || '',
      pricePerPerson: activity.pricePerPerson || false,
      availability: activity.availability || '',
      description: activity.description || '',
      highlights: activity.highlights?.length > 0 ? [...activity.highlights] : [''],
      category: activity.category || activity.industry || '',
    });
    setEditImages({ main: null, gallery1: null, gallery2: null, gallery3: null });
    setEditPreviews({
      main: getImageUrl(activity.image) || '',
      gallery1: getImageUrl(activity.images?.[0]) || '',
      gallery2: getImageUrl(activity.images?.[1]) || '',
      gallery3: getImageUrl(activity.images?.[2]) || '',
    });
    setShowEdit(true);
  };

  const closeEdit = () => {
    setClosingEdit(true);
    setTimeout(() => { setShowEdit(false); setClosingEdit(false); }, 300);
  };

  const handleEditInput = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditHL = (i, v) => {
    const hs = [...editForm.highlights]; hs[i] = v;
    setEditForm(p => ({ ...p, highlights: hs }));
  };

  const handleEditImg = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImages(p => ({ ...p, [key]: file }));
      setEditPreviews(p => ({ ...p, [key]: URL.createObjectURL(file) }));
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fd = new FormData();
      Object.keys(editForm).forEach(k => {
        if (k === 'highlights') {
          fd.append(k, JSON.stringify(editForm.highlights.filter(h => h.trim())));
        } else fd.append(k, editForm[k]);
      });
      if (editImages.main) fd.append('image', editImages.main);
      if (editImages.gallery1) fd.append('images', editImages.gallery1);
      if (editImages.gallery2) fd.append('images', editImages.gallery2);
      if (editImages.gallery3) fd.append('images', editImages.gallery3);

      const res = await api.put(`/activities/${activity._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = res.data?.data || res.data;
      setActivity(updated);
      setActiveImage(getImageUrl(updated.image) || getImageUrl(updated.images?.[0]) || FALLBACK);
      closeEdit();
    } catch { alert(t('saveFailed', 'Failed to save changes')); }
    finally { setIsSaving(false); }
  };

  /* ── Delete handlers ── */
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/activities/${activity._id}`);
      navigate('/founder/dashboard');
    } catch { alert(t('deleteFailed', 'Failed to delete')); setIsDeleting(false); }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('loading', 'Loading...')}</div>;
  if (!activity) return <div style={{ padding: '60px', textAlign: 'center', color: '#DC2626' }}>{t('notFound', 'Activity not found.')}</div>;

  const title = activity.title || 'No Title';
  const desc = activity.description || 'No description available.';
  const actLocation = activity.location || activity.city || 'N/A';
  const cost = activity.price || 0;
  const rating = activity.rating || 0;
  const reviewsCount = activity.reviewsCount || 0;
  const duration = activity.duration || 'N/A';
  const availability = activity.availability || 'N/A';
  const highlights = activity.highlights || [];

  const DEFAULTS = [
    'https://images.unsplash.com/photo-1521685375508-6625805eec06?auto=format&fit=crop&q=80&w=2670',
    'https://images.unsplash.com/photo-1516086786016-11f81016834d?auto=format&fit=crop&q=80&w=2670',
    'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?auto=format&fit=crop&q=80&w=2670',
  ];
  let thumbs = (activity.images || []).map(getImageUrl).filter(Boolean);
  if (thumbs.length === 0) thumbs = [getImageUrl(activity.image) || FALLBACK];
  while (thumbs.length < 3) thumbs.push(DEFAULTS[thumbs.length % 3]);
  thumbs = thumbs.slice(0, 3);

  const isOwner = activity && user && (
    activity.founder === user._id || 
    (activity.founder && activity.founder._id === user._id)
  );

  return (
    <div className="fpd-page">
      {/* Header */}
      <div className="fpd-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 600, transition: '0.2s' }}>
            <BackIcon /> {t('back', 'Back')}
          </button>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-main)' }}>{t('postDetails', 'Post Details')}</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{t('postDetailsSubtitle', 'View and manage all information regarding this activity.')}</p>
          </div>
        </div>
        {isOwner && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={openEdit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>
              <EditIcon /> {t('edit', 'Edit')}
            </button>
            <button onClick={() => setShowDelete(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#FEE2E2', color: '#DC2626', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>
              <TrashIcon /> {t('delete', 'Delete')}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="fpd-content">
        {/* Images */}
        <div className="fpd-images-col">
          <div className="fpd-main-img-wrapper">
            <img src={activeImage} alt={title} className="fpd-main-img" onError={(e) => { if (!e.target.dataset.failed) { e.target.dataset.failed = true; e.target.src = FALLBACK; } }} />
          </div>
          <div className="fpd-thumb-row">
            {thumbs.map((thumb, idx) => (
              <img key={idx} src={thumb} alt={`Thumb ${idx + 1}`} className={`fpd-thumb ${activeImage === thumb ? 'active' : ''}`} onClick={() => setActiveImage(thumb)} onError={(e) => { if (!e.target.dataset.failed) { e.target.dataset.failed = true; e.target.src = DEFAULTS[idx] || DEFAULTS[0]; } }} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="fpd-info-col">
          <h1 className="fpd-info-title">{title}</h1>
          <div className="fpd-meta-row">
            <span className="fpd-meta-item"><LocationIcon /> {actLocation}</span>
            <span className="fpd-meta-item"><ClockIcon /> {t('duration', 'Duration')}: {duration}</span>
            <span className="fpd-meta-item fpd-meta-rating"><StarIcon /> {activity.rating || '0.0'} ({activity.reviewsCount || 0} {t('reviews', 'Reviews')})</span>
          </div>
          {(activity.category || activity.industry) && (
            <span style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
              {activity.category || activity.industry}
            </span>
          )}
          <p className="fpd-desc">{desc}</p>
          {highlights.length > 0 && (
            <div className="fpd-section">
              <h3>{t('activityHighlights', 'Activity Highlights')}</h3>
              <ul className="fpd-highlights">
                {highlights.map((hl, i) => <li key={i}><TargetIcon /> {hl}</li>)}
              </ul>
            </div>
          )}
          <div className="fpd-section">
            <h3>{t('cost', 'Cost')}</h3>
            <div className="fpd-list-item">
              <MoneyIcon /> {Number(cost).toLocaleString()} {t('egp', 'EGP')} {activity.pricePerPerson ? t('perPerson', 'per person') : ''}
            </div>
          </div>
          <div className="fpd-section">
            <h3>{t('availability', 'Availability')}</h3>
            <div className="fpd-list-item"><CalendarIcon /> {availability}</div>
          </div>
        </div>
      </div>

      {/* ── Delete Modal ── */}
      {showDelete && (
        <div className="otp-overlay">
          <div className="otp-popup">
            <button className="otp-close-btn" onClick={() => setShowDelete(false)} disabled={isDeleting}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div className="otp-icon"><DangerIcon /></div>
            <h2>{t('confirmDelete', 'Confirm Delete')}</h2>
            <p className="otp-subtitle">{t('confirmDeletePost', 'Are you sure you want to delete this post? This action cannot be undone.')}</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', width: '100%' }}>
              <button onClick={() => setShowDelete(false)} disabled={isDeleting} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>
                {t('cancel', 'Cancel')}
              </button>
              <button onClick={confirmDelete} disabled={isDeleting} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {isDeleting ? t('deleting', 'Deleting...') : t('delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEdit && (
        <div className="otp-overlay" style={{ zIndex: 1000, overflowY: 'auto', padding: '40px 20px' }}>
          <div className={`otp-popup ${closingEdit ? 'otp-popup-closing' : ''}`} style={{ maxWidth: '800px', width: '100%', padding: '30px', margin: 'auto' }}>
            <button className="otp-close-btn" type="button" onClick={closeEdit} disabled={isSaving}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <h2 className="fp-title" style={{ textAlign: 'left', marginBottom: '6px' }}>{t('editPost', 'Edit Post')}</h2>
            <p className="fp-subtitle" style={{ textAlign: 'left', marginBottom: '24px' }}>{t('editPostDesc', 'Update the details of your activity.')}</p>
            <form onSubmit={submitEdit} className="fp-form-card" style={{ padding: 0, boxShadow: 'none', marginBottom: 0, textAlign: 'left' }}>
              <div className="fp-grid">
                <div className="fp-input-group full-width">
                  <label>{t('activityTitle', 'Activity Title')} *</label>
                  <input type="text" name="title" className="fp-input" value={editForm.title} onChange={handleEditInput} required />
                </div>
                <div className="fp-input-group">
                  <label>{t('location', 'Location')} *</label>
                  <input type="text" name="location" className="fp-input" value={editForm.location} onChange={handleEditInput} required />
                </div>
                <div className="fp-input-group">
                  <label>{t('duration', 'Duration')}</label>
                  <input type="text" name="duration" className="fp-input" value={editForm.duration} onChange={handleEditInput} />
                </div>
                <div className="fp-input-group">
                  <label>{t('price', 'Price')} *</label>
                  <input type="number" name="price" className="fp-input" value={editForm.price} onChange={handleEditInput} required />
                </div>
                <div className="fp-input-group">
                  <label>{t('industry', 'Industry')}</label>
                  <select name="category" className="fp-input fp-select" value={editForm.industry || editForm.category} onChange={handleEditInput}>
                    <option value="">{t('selectIndustry', '— Select Industry —')}</option>
                    <option value="technology">{t('technology', 'Technology')}</option>
                    <option value="food">{t('food', 'Food & Beverage')}</option>
                    <option value="tourism">{t('tourism', 'Tourism & Hospitality')}</option>
                    <option value="healthcare">{t('healthcare', 'Healthcare & Wellness')}</option>
                    <option value="education">{t('education', 'Education & Training')}</option>
                    <option value="retail">{t('retail', 'Retail & E-commerce')}</option>
                    <option value="entertainment">{t('entertainment', 'Entertainment & Media')}</option>
                    <option value="sports">{t('sports', 'Sports & Fitness')}</option>
                    <option value="finance">{t('finance', 'Finance & Banking')}</option>
                    <option value="manufacturing">{t('manufacturing', 'Manufacturing')}</option>
                    <option value="other">{t('other', 'Other')}</option>
                  </select>
                </div>
                <div className="fp-input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" name="pricePerPerson" id="fpd-ppp" checked={editForm.pricePerPerson} onChange={handleEditInput} style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="fpd-ppp" style={{ margin: 0, cursor: 'pointer' }}>{t('pricePerPerson', 'Price per person')}</label>
                </div>
                <div className="fp-input-group full-width">
                  <label>{t('availability', 'Availability')}</label>
                  <input type="text" name="availability" className="fp-input" value={editForm.availability} onChange={handleEditInput} />
                </div>
                <div className="fp-input-group full-width">
                  <label>{t('description', 'Description')}</label>
                  <textarea name="description" className="fp-textarea" value={editForm.description} onChange={handleEditInput}></textarea>
                </div>
                <div className="fp-input-group full-width">
                  <label>{t('activityHighlights', 'Highlights')}</label>
                  <div className="fp-highlights-container">
                    {editForm.highlights.map((h, i) => (
                      <div key={i} className="fp-highlight-row">
                        <input type="text" className="fp-input" style={{ flex: 1 }} value={h} onChange={e => handleEditHL(i, e.target.value)} />
                        {editForm.highlights.length > 1 && (
                          <button type="button" className="fp-btn-remove" onClick={() => setEditForm(p => ({ ...p, highlights: p.highlights.filter((_, x) => x !== i) }))}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="fp-btn-add" onClick={() => setEditForm(p => ({ ...p, highlights: [...p.highlights, ''] }))}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      {t('addHighlight', 'Add Highlight')}
                    </button>
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px', display: 'block' }}>{t('images', 'Images')}</label>
                  <div className="fp-image-grid" style={{ height: '160px' }}>
                    {['main', 'gallery1', 'gallery2', 'gallery3'].map((key, i) => (
                      <div key={key} className={`fp-image-dropzone${key === 'main' ? ' main-image' : ''}`} onClick={() => editRefs[key].current?.click()}>
                        <input type="file" ref={editRefs[key]} style={{ display: 'none' }} accept="image/*" onChange={e => handleEditImg(key, e)} />
                        {editPreviews[key] ? (
                          <><img src={editPreviews[key]} alt={key} className="fp-image-preview" /><div className="fp-image-overlay">{key === 'main' ? t('changeCover', 'Change Cover') : t('change', 'Change')}</div></>
                        ) : (
                          <div className="fp-dropzone-text">+<br />{key === 'main' ? t('mainCover', 'Main Cover') : `${t('gallery', 'Gallery')} ${i}`}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="button" onClick={closeEdit} disabled={isSaving} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>
                  {t('cancel', 'Cancel')}
                </button>
                <button type="submit" disabled={isSaving} className="fp-submit-btn" style={{ flex: 1, margin: 0, padding: '14px' }}>
                  {isSaving ? t('saving', 'Saving...') : t('saveChanges', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderPostDetails;
