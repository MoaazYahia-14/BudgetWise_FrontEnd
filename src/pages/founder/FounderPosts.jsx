import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import '../../styles/pages/founder/FounderPosts.css';

const FounderPosts = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    city: 'Cairo',
    duration: '',
    price: '',
    pricePerPerson: false,
    availability: '',
    description: '',
    highlights: [''],
    category: ''
  });

  const [images, setImages] = useState({
    main: null,
    gallery1: null,
    gallery2: null,
    gallery3: null
  });

  const [previews, setPreviews] = useState({
    main: '',
    gallery1: '',
    gallery2: '',
    gallery3: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRefs = {
    main: useRef(null),
    gallery1: useRef(null),
    gallery2: useRef(null),
    gallery3: useRef(null)
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData(prev => ({ ...prev, highlights: newHighlights }));
  };

  const addHighlight = () => {
    setFormData(prev => ({ ...prev, highlights: [...prev.highlights, ''] }));
  };

  const removeHighlight = (index) => {
    const newHighlights = formData.highlights.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, highlights: newHighlights }));
  };

  const triggerFileInput = (key) => {
    fileInputRefs[key].current?.click();
  };

  const handleImageChange = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      setImages(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const submitData = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key === 'highlights') {
          // Filter out empty highlights
          const filtered = formData.highlights.filter(h => h.trim() !== '');
          submitData.append(key, JSON.stringify(filtered));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Append files
      if (images.main) {
        submitData.append('image', images.main);
      } else {
        throw new Error(t('mainImageRequired') || 'Main cover image is required');
      }

      if (images.gallery1) submitData.append('images', images.gallery1);
      if (images.gallery2) submitData.append('images', images.gallery2);
      if (images.gallery3) submitData.append('images', images.gallery3);

      await api.post('/activities', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg(t('postCreatedSuccess') || 'Activity posted successfully!');
      
      // Reset form
      setFormData({
        title: '', location: '', city: 'Cairo', duration: '', price: '',
        pricePerPerson: false, availability: '', description: '',
        highlights: [''], category: ''
      });
      setImages({ main: null, gallery1: null, gallery2: null, gallery3: null });
      setPreviews({ main: '', gallery1: '', gallery2: '', gallery3: '' });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.message || err.response?.data?.message || t('somethingWentWrong'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="founder-posts-container">
      <div className="fp-header">
        <h1 className="fp-title">{t('createNewPost', 'Create New Post')}</h1>
        <p className="fp-subtitle">{t('createNewPostDesc', 'Fill in the details to publish a new activity or service for the users.')}</p>
      </div>

      {errorMsg && <div className="fp-alert error">{errorMsg}</div>}
      {successMsg && <div className="fp-alert success">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="fp-form-card">
        
        {/* Basic Info */}
        <div className="fp-grid">
          <div className="fp-input-group full-width">
            <label>{t('activityTitle', 'Activity Title')} *</label>
            <input 
              type="text" 
              name="title" 
              className="fp-input" 
              placeholder="e.g. Skydiving Experience in Cairo" 
              value={formData.title} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="fp-input-group">
            <label>{t('location', 'Location')} *</label>
            <input 
              type="text" 
              name="location" 
              className="fp-input" 
              placeholder="e.g. Cairo, Egypt" 
              value={formData.location} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="fp-input-group">
            <label>{t('duration', 'Duration')}</label>
            <input 
              type="text" 
              name="duration" 
              className="fp-input" 
              placeholder="e.g. 2 Hours" 
              value={formData.duration} 
              onChange={handleInputChange} 
            />
          </div>

          <div className="fp-input-group">
            <label>{t('price', 'Price')} *</label>
            <input 
              type="number" 
              name="price" 
              className="fp-input" 
              placeholder="e.g. 1800" 
              value={formData.price} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="fp-input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              name="pricePerPerson" 
              id="pricePerPerson" 
              checked={formData.pricePerPerson} 
              onChange={handleInputChange} 
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="pricePerPerson" style={{ margin: 0, cursor: 'pointer' }}>{t('pricePerPerson', 'Price is per person')}</label>
          </div>

          <div className="fp-input-group full-width">
            <label>{t('availability', 'Availability')}</label>
            <input 
              type="text" 
              name="availability" 
              className="fp-input" 
              placeholder="e.g. Available Daily: 9:00 AM - 5:00 PM" 
              value={formData.availability} 
              onChange={handleInputChange} 
            />
          </div>

          <div className="fp-input-group full-width">
            <label>{t('industry', 'Industry')} *</label>
            <select name="category" className="fp-input fp-select" value={formData.category} onChange={handleInputChange} required>
              <option value="">{t('selectIndustry', '— Select Industry —')}</option>
              <option value="technology">Technology</option>
              <option value="food">Food &amp; Beverage</option>
              <option value="tourism">Tourism &amp; Hospitality</option>
              <option value="healthcare">Healthcare &amp; Wellness</option>
              <option value="education">Education &amp; Training</option>
              <option value="retail">Retail &amp; E-commerce</option>
              <option value="entertainment">Entertainment &amp; Media</option>
              <option value="sports">Sports &amp; Fitness</option>
              <option value="finance">Finance &amp; Banking</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="fp-input-group full-width">
            <label>{t('description', 'Description')}</label>
            <textarea 
              name="description" 
              className="fp-textarea" 
              placeholder={t('descriptionDesc', 'Experience the ultimate adrenaline rush...')} 
              value={formData.description} 
              onChange={handleInputChange} 
            ></textarea>
          </div>
        </div>

        {/* Highlights */}
        <div className="fp-input-group full-width" style={{ marginTop: '20px' }}>
          <label>{t('activityHighlights', 'Activity Highlights')}</label>
          <div className="fp-highlights-container">
            {formData.highlights.map((h, i) => (
              <div key={i} className="fp-highlight-row">
                <input 
                  type="text" 
                  className="fp-input" 
                  style={{ flex: 1 }} 
                  placeholder={t('highlightPlaceholder', 'e.g. Tandem Jump with Certified Instructor')} 
                  value={h} 
                  onChange={(e) => handleHighlightChange(i, e.target.value)} 
                />
                {formData.highlights.length > 1 && (
                  <button type="button" className="fp-btn-remove" onClick={() => removeHighlight(i)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="fp-btn-add" onClick={addHighlight}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              {t('addHighlight', 'Add Highlight')}
            </button>
          </div>
        </div>

        {/* Image Upload Grid */}
        <div className="fp-image-upload-section">
          <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px', display: 'block' }}>
            {t('uploadImages', 'Upload Images')} (1 Cover, 3 Gallery) *
          </label>
          
          <div className="fp-image-grid">
            {/* Main Cover */}
            <div className="fp-image-dropzone main-image" onClick={() => triggerFileInput('main')}>
              <input type="file" ref={fileInputRefs.main} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageChange('main', e)} />
              {previews.main ? (
                <>
                  <img src={previews.main} alt="Cover Preview" className="fp-image-preview" />
                  <div className="fp-image-overlay">{t('changeCover', 'Change Cover')}</div>
                </>
              ) : (
                <div className="fp-dropzone-text">
                  <svg width="32" height="32" style={{ marginBottom: '8px', color: '#9CA3AF' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <br />{t('uploadCoverImage', 'Upload Cover Image')}
                </div>
              )}
            </div>

            {/* Gallery 1 */}
            <div className="fp-image-dropzone" onClick={() => triggerFileInput('gallery1')}>
              <input type="file" ref={fileInputRefs.gallery1} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageChange('gallery1', e)} />
              {previews.gallery1 ? (
                <>
                  <img src={previews.gallery1} alt="Gallery 1" className="fp-image-preview" />
                  <div className="fp-image-overlay">{t('change', 'Change')}</div>
                </>
              ) : (
                <div className="fp-dropzone-text">+</div>
              )}
            </div>

            {/* Gallery 2 */}
            <div className="fp-image-dropzone" onClick={() => triggerFileInput('gallery2')}>
              <input type="file" ref={fileInputRefs.gallery2} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageChange('gallery2', e)} />
              {previews.gallery2 ? (
                <>
                  <img src={previews.gallery2} alt="Gallery 2" className="fp-image-preview" />
                  <div className="fp-image-overlay">{t('change', 'Change')}</div>
                </>
              ) : (
                <div className="fp-dropzone-text">+</div>
              )}
            </div>

            {/* Gallery 3 */}
            <div className="fp-image-dropzone" onClick={() => triggerFileInput('gallery3')}>
              <input type="file" ref={fileInputRefs.gallery3} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageChange('gallery3', e)} />
              {previews.gallery3 ? (
                <>
                  <img src={previews.gallery3} alt="Gallery 3" className="fp-image-preview" />
                  <div className="fp-image-overlay">{t('change', 'Change')}</div>
                </>
              ) : (
                <div className="fp-dropzone-text">+</div>
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="fp-submit-btn" disabled={loading}>
          {loading ? t('posting', 'Posting...') : t('publishPost', 'Publish Post')}
        </button>
      </form>
    </div>
  );
};

export default FounderPosts;
