import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToPlan } from '../services/planService';
import { getAllActivities, searchActivities, getRecommendedActivities } from '../services/activityService';
import { getImageUrl } from '../utils/imageUtils';
import '../styles/pages/Explore.css';



// SVG Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
    <line x1="2" y1="10" x2="22" y2="10"></line>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const Explore = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  // Also update when URL changes
  useEffect(() => {
    const currentQuery = new URLSearchParams(location.search).get('q') || '';
    setSearchQuery(currentQuery);
  }, [location.search]);
  
  const [filters, setFilters] = useState({
    budget: '',
    category: '',
    location: '',
    rating: ''
  });
  
  const [customBudget, setCustomBudget] = useState({ min: '', max: '' });
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'recommended'

  const mapActivity = (act) => {
    // Determine the main image robustly
    let actImage = act.image;
    if (!actImage || actImage.includes('loremflickr')) {
      actImage = (act.images && act.images.length > 0 && !act.images[0].includes('loremflickr')) 
        ? act.images[0] 
        : 'https://images.unsplash.com/photo-1538600863810-753bc6e0b7cb?auto=format&fit=crop&q=80&w=800';
    }

    return {
      ...act,
      id: act._id || act.id,
      cost: act.price || act.cost || 0,
      location: act.location || act.city || '',
      image: getImageUrl(actImage),
      images: (act.images || []).map(getImageUrl),
    };
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      if (filterMode === 'recommended') {
        const res = await getRecommendedActivities();
        const data = res.data?.data;
        let activitiesList = Array.isArray(data) ? data : (data?.activities || []);
        
        // BUG-009: Apply local filtering for recommended activities
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          activitiesList = activitiesList.filter(a => a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
        }
        if (filters.category) {
          activitiesList = activitiesList.filter(a => a.category?.toLowerCase() === filters.category.toLowerCase());
        }
        if (filters.location) {
          activitiesList = activitiesList.filter(a => a.city === filters.location || a.location === filters.location);
        }
        if (filters.rating) {
          activitiesList = activitiesList.filter(a => (a.rating || 0) >= Number(filters.rating));
        }
        if (filters.budget) {
          const getPrice = a => a.price || a.cost || 0;
          if (filters.budget === '0-500') activitiesList = activitiesList.filter(a => getPrice(a) <= 500);
          else if (filters.budget === '500-1000') activitiesList = activitiesList.filter(a => getPrice(a) >= 500 && getPrice(a) <= 1000);
          else if (filters.budget === '1000+') activitiesList = activitiesList.filter(a => getPrice(a) >= 1000);
          else if (filters.budget === 'custom') {
            const min = customBudget.min ? Number(customBudget.min) : 0;
            const max = customBudget.max ? Number(customBudget.max) : Infinity;
            activitiesList = activitiesList.filter(a => getPrice(a) >= min && getPrice(a) <= max);
          }
        }
        
        setActivities(activitiesList.map(mapActivity));
      } else {
        const queryParams = {};
        if (searchQuery.trim()) queryParams.q = searchQuery;
        if (filters.category) queryParams.category = filters.category;
        if (filters.location) queryParams.city = filters.location;
        if (filters.rating) queryParams.rating = filters.rating;
        
        if (filters.budget === '0-500') {
          queryParams.maxPrice = 500;
        } else if (filters.budget === '500-1000') {
          queryParams.minPrice = 500;
          queryParams.maxPrice = 1000;
        } else if (filters.budget === '1000+') {
          queryParams.minPrice = 1000;
        } else if (filters.budget === 'custom') {
          if (customBudget.min) queryParams.minPrice = customBudget.min;
          if (customBudget.max) queryParams.maxPrice = customBudget.max;
        }

        const res = await getAllActivities(queryParams);
        const data = res.data?.data;
        const activitiesList = Array.isArray(data) ? data : (data?.activities || []);
        setActivities(activitiesList.map(mapActivity));
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchActivities();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterMode, filters, customBudget]);

  const handleViewDetails = (act) => {
    navigate(`/user/activity/${act.id}`, { state: { activity: act } });
  };

  const addMutation = useMutation({
    mutationFn: (payload) => addToPlan(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['myPlanItems'] });
      queryClient.invalidateQueries({ queryKey: ['myPlan'] });
      queryClient.invalidateQueries({ queryKey: ['planSummary'] });
      queryClient.invalidateQueries({ queryKey: ['myBudget'] });
      queryClient.invalidateQueries({ queryKey: ['budgetStats'] });

      const serverMsg = res.data?.message;
      setPopupMessage(serverMsg || t('addedToPlanSuccess') || 'Added to plan successfully!');
      setIsSuccess(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    },
    onError: (err) => {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;

      if (status === 409) {
        setPopupMessage(serverMsg || t('alreadyInPlan') || 'Already in your plan!');
      } else {
        setPopupMessage(serverMsg || 'An error occurred.');
      }
      setIsSuccess(false);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    }
  });

  const handleAddToPlan = (act) => {
    const payload = {
      activityId: String(act.id),
      title:      act.title,
      description: act.description || '',
      cost:       Number(act.cost) || 0,
      location:   act.location || '',
      image:      act.image || '',
      images:     act.images || [],
      rating:     act.rating || 0,
    };
    addMutation.mutate(payload);
  };

  return (
    <div className="explore-page page-transition">
      <div className="explore-header">
        <h1>{t('exploreActivities') || 'Explore Activities'}</h1>
        <p>{t('exploreSubtitle') || 'Discover activities that match your budget and interests'}</p>
      </div>

      <div className="explore-controls">
        <div className="search-bar-wrapper">
          <div className="search-input-container">
            <SearchIcon />
            <input 
              type="text" 
              placeholder={t('searchActivities') || 'Search activities...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className={`filter-sort-btn ${filterMode === 'recommended' ? 'active-filter' : ''}`}
            onClick={() => setFilterMode(filterMode === 'recommended' ? 'all' : 'recommended')}
            style={{ background: filterMode === 'recommended' ? '#6C63FF' : '', color: filterMode === 'recommended' ? 'white' : '' }}
          >
            {t('filterBy') || 'Filter By :'} <strong>{filterMode === 'recommended' ? (t('recommended') || 'Recommended') : (t('all') || 'All')}</strong>
          </button>
        </div>

        <div className="filter-dropdowns">
          <div className="filter-select-wrapper">
            <select 
              className="filter-dropdown" 
              value={filters.budget}
              onChange={(e) => setFilters({...filters, budget: e.target.value})}
              style={{ appearance: 'none', paddingRight: '30px' }}
            >
              <option value="">{t('budget') || 'All Budgets'}</option>
              <option value="0-500">Under 500 EGP</option>
              <option value="500-1000">500 - 1000 EGP</option>
              <option value="1000+">1000+ EGP</option>
              <option value="custom">Custom Range...</option>
            </select>
            <ChevronDownIcon />
          </div>

          {filters.budget === 'custom' && (
            <div className="custom-budget-inputs">
              <input 
                type="number" 
                placeholder="Min" 
                value={customBudget.min} 
                onChange={(e) => setCustomBudget({...customBudget, min: e.target.value})} 
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={customBudget.max} 
                onChange={(e) => setCustomBudget({...customBudget, max: e.target.value})} 
              />
            </div>
          )}

          <div className="filter-select-wrapper">
            <select 
              className="filter-dropdown" 
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              style={{ appearance: 'none', paddingRight: '30px' }}
            >
              <option value="">{t('category') || 'All Categories'}</option>
              <option value="technology">Technology</option>
              <option value="food">Food & Dining</option>
              <option value="tourism">Tourism & Travel</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="retail">Retail & Shopping</option>
              <option value="entertainment">Entertainment</option>
              <option value="sports">Sports</option>
              <option value="finance">Finance</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
            <ChevronDownIcon />
          </div>

          <div className="filter-select-wrapper">
            <select 
              className="filter-dropdown" 
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              style={{ appearance: 'none', paddingRight: '30px' }}
            >
              <option value="">{t('location') || 'All Locations'}</option>
              <optgroup label="Egypt 🇪🇬">
                <option value="Cairo">Cairo</option>
                <option value="Giza">Giza</option>
                <option value="Alexandria">Alexandria</option>
                <option value="Sharm El-Sheikh">Sharm El-Sheikh</option>
                <option value="Hurghada">Hurghada</option>
                <option value="Luxor">Luxor</option>
                <option value="Aswan">Aswan</option>
              </optgroup>
              <optgroup label="Saudi Arabia 🇸🇦">
                <option value="Riyadh">Riyadh</option>
                <option value="Jeddah">Jeddah</option>
                <option value="Mecca">Mecca</option>
                <option value="Medina">Medina</option>
                <option value="Dammam">Dammam</option>
              </optgroup>
              <optgroup label="UAE 🇦🇪">
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
              </optgroup>
            </select>
            <ChevronDownIcon />
          </div>

          <div className="filter-select-wrapper">
            <select 
              className="filter-dropdown" 
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: e.target.value})}
              style={{ appearance: 'none', paddingRight: '30px' }}
            >
              <option value="">{t('rating') || 'Any Rating'}</option>
              <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
              <option value="3">⭐⭐⭐ 3+ Stars</option>
              <option value="2">⭐⭐ 2+ Stars</option>
              <option value="1">⭐ 1+ Stars</option>
            </select>
            <ChevronDownIcon />
          </div>
        </div>
      </div>

      <div className="activities-grid">
        {loading ? (
          <div className="loading-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(108, 99, 255, 0.2)', borderTopColor: '#6C63FF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p>{t('loading') || 'Loading activities...'}</p>
          </div>
        ) : activities.length > 0 ? (
          activities.map((act) => (
            <div key={act.id} className="activity-card">
              <div className="activity-image">
                {/* Fallback pattern for missing images */}
                <img 
                  src={act.image} 
                  alt={act.title} 
                  onError={(e) => { 
                    if (!e.target.dataset.failed) {
                      e.target.dataset.failed = true;
                      e.target.src = 'https://images.unsplash.com/photo-1538600863810-753bc6e0b7cb?auto=format&fit=crop&q=80&w=800';
                    }
                  }} 
                />
              </div>
              <div className="activity-content">
                <div className="activity-title-row">
                  <h3>{act.title}</h3>
                  <div className="activity-rating">
                    <StarIcon /> <span>{act.rating}</span>
                  </div>
                </div>
                {act.category && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ background: 'rgba(108,99,255,0.1)', color: '#6C63FF', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      {act.category === 'other' && act.customCategory ? `Other - ${act.customCategory}` : (act.category.charAt(0).toUpperCase() + act.category.slice(1))}
                    </span>
                  </div>
                )}
                <p className="activity-desc">{act.description}</p>
                
                <div className="activity-details">
                  <div className="detail-item">
                    <WalletIcon /> <span>{act.cost} {t('egp') || 'EGP'}</span>
                  </div>
                  <div className="detail-item">
                    <LocationIcon /> <span>{act.location}</span>
                  </div>
                </div>

                <div className="activity-actions">
                  <button className="btn-add-plan" onClick={() => handleAddToPlan(act)} disabled={addMutation.isPending}>{t('addToPlan') || 'Add to Plan'}</button>
                  <button className="btn-view-details" onClick={() => handleViewDetails(act)}>{t('viewDetails') || 'View Details'}</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            <p>{t('noActivitiesFound') || 'No activities found. Try adjusting your search.'}</p>
          </div>
        )}
      </div>

      {/* Success/Error Popup */}
      {showPopup && (
        <div className="otp-overlay">
          <div className="otp-popup">
            <div className="otp-success-screen">
              {isSuccess ? (
                <div className="otp-checkmark">
                  <svg viewBox="0 0 52 52" className="otp-checkmark-svg">
                    <circle className="otp-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="otp-checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
              ) : (
                <div style={{ fontSize: '48px', color: '#DC2626' }}>⚠️</div>
              )}
              <h2 className="otp-success-title">{isSuccess ? (t('success') || 'Success!') : (t('info') || 'Info')}</h2>
              <p className="otp-success-msg">{popupMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
