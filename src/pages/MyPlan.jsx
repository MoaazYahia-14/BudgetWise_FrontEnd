import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyPlan, removeFromPlan, addToPlan } from '../services/planService';
import { getImageUrl } from '../utils/imageUtils';
import '../styles/pages/MyPlan.css';

/* ==============================
   Icons
   ============================== */
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const BagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const PlannedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const BulbIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"></path>
    <path d="M10 22h4"></path>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.53.64 2.88 1.5 3.5.76.76 1.23 1.52 1.41 2.5"></path>
  </svg>
);

/* ==============================
   Data
   ============================== */
// BUG-003: Removed INITIAL_PLAN dummy data


/* ==============================
   Component
   ============================== */
const MyPlan = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [closingAddModal, setClosingAddModal] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityCost, setNewActivityCost] = useState('');
  const [newActivityLocation, setNewActivityLocation] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);

  // Fetch plan from API
  const { data: planData = {}, isLoading: loading, isError, error: queryError } = useQuery({
    queryKey: ['myPlanItems'],
    queryFn: async () => {
      const res = await getMyPlan();
      return res.data?.data || {};
    }
  });

  const planItems = Array.isArray(planData.items) ? planData.items : [];
  const budgetSummary = planData.budgetSummary || null;
  const error = isError ? (queryError?.message || 'Failed to load plan.') : null;

  const totalBudget = budgetSummary?.totalBudget ?? 3000;
  const planned = budgetSummary?.spent ?? planItems.reduce((acc, item) => acc + (Number(item.cost || item.price) || 0), 0);
  const remaining = budgetSummary?.remaining ?? (totalBudget - planned);
  const plannedPct = totalBudget > 0 ? Math.min((planned / totalBudget) * 100, 100) : 0;

  const deleteMutation = useMutation({
    mutationFn: (id) => removeFromPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPlanItems'] });
      queryClient.invalidateQueries({ queryKey: ['myPlan'] });
      queryClient.invalidateQueries({ queryKey: ['planSummary'] });
      queryClient.invalidateQueries({ queryKey: ['myBudget'] });
      queryClient.invalidateQueries({ queryKey: ['budgetStats'] });
    },
    onError: (err) => {
      console.error('Failed to delete item:', err);
    }
  });

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const openAddModal = () => {
    setNewActivityTitle('');
    setNewActivityCost('');
    setNewActivityLocation('');
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setClosingAddModal(true);
    setTimeout(() => {
      setShowAddModal(false);
      setClosingAddModal(false);
    }, 300);
  };

  const addMutation = useMutation({
    mutationFn: (payload) => addToPlan(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['myPlanItems'] });
      queryClient.invalidateQueries({ queryKey: ['myPlan'] });
      queryClient.invalidateQueries({ queryKey: ['planSummary'] });
      queryClient.invalidateQueries({ queryKey: ['myBudget'] });
      queryClient.invalidateQueries({ queryKey: ['budgetStats'] });
      
      closeAddModal();
      setPopupMessage(res.data?.message || t('addedToPlanSuccess') || 'Added successfully!');
      setIsSuccess(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message;
      setPopupMessage(msg || t('failedToAdd') || 'Failed to add activity');
      setIsSuccess(false);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    }
  });

  const handleAddCustomActivity = () => {
    if (!newActivityTitle || !newActivityCost) return;
    addMutation.mutate({
      title: newActivityTitle,
      cost: Number(newActivityCost),
      location: newActivityLocation,
      image: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&q=80&w=2670',
      rating: 5
    });
  };

  return (
    <div className="my-plan-page">
      {loading && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</p>}
      {error && <p style={{ textAlign: 'center', padding: '40px', color: '#EF4444' }}>{error}</p>}
      {!loading && !error && <>

      {/* ── Header ── */}
      <div className="mp-header">
        <div className="mp-header-text">
          <h1 className="mp-title">{t('myPlan')}</h1>
          <p className="mp-subtitle">{t('manageActivities')}</p>
        </div>
        <button className="mp-btn-primary" onClick={openAddModal}>
          <PlusIcon /> {t('addActivity')}
        </button>
      </div>

      {/* ── Budget Summary Cards ── */}
      <div className="mp-summary-cards">
        {/* Total Budget */}
        <div className="mp-summary-card">
          <div className="mp-card-top">
            <div className="mp-card-icon-title">
              <div className="mp-icon-box bg-grey"><BagIcon /></div>
              <span className="mp-card-name">{t('totalBudget')}</span>
            </div>
          </div>
          <div className="mp-card-value">
            {totalBudget.toLocaleString()} <span className="mp-currency">{t('egp')}</span>
          </div>
        </div>

        {/* Planned */}
        <div className="mp-summary-card">
          <div className="mp-card-top">
            <div className="mp-card-icon-title">
              <div className="mp-icon-box bg-purple"><PlannedIcon /></div>
              <span className="mp-card-name">{t('planned')}</span>
            </div>
            <span className="mp-card-badge text-purple">{t('vsPlanned')}</span>
          </div>
          <div className="mp-card-value">
            {planned.toLocaleString()} <span className="mp-currency">{t('egp')}</span>
          </div>
        </div>

        {/* Remaining */}
        <div className="mp-summary-card">
          <div className="mp-card-top">
            <div className="mp-card-icon-title">
              <div className="mp-icon-box bg-orange"><BagIcon /></div>
              <span className="mp-card-name">{t('remaining')}</span>
            </div>
            <span className="mp-card-badge text-orange">{t('vsLastPlan')}</span>
          </div>
          <div className="mp-card-value">
            {remaining.toLocaleString()} <span className="mp-currency">{t('egp')}</span>
          </div>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="mp-global-progress-section">
        <div className="mp-progress-row">
          <div className="mp-progress-bar-container">
            <div className="mp-progress-bar-fill" style={{ width: `${plannedPct}%` }}></div>
          </div>
          <span className="mp-progress-percent">{plannedPct.toFixed(1)}%</span>
        </div>
        <p className="mp-progress-text">
          {t('plannedOutOfTotal', { planned, total: totalBudget })}
        </p>
      </div>

      {/* ── Plan Items List ── */}
      <div className="mp-activity-list">
          {planItems.map((item, index) => {
            const itemId = item.activityId || item._id || item.id;
            return (
              <div key={itemId || index} className="mp-activity-card">
                <img
                  src={getImageUrl(item.image || item.img)}
                  alt={item.title || t(item.titleKey)}
                  className="mp-activity-img"
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'Activity')}&background=6C63FF&color=fff&size=200`; }}
                />
                <div className="mp-activity-details">
                  <h3 className="mp-activity-title">{t(item.titleKey || item.title) || item.title}</h3>
              
              <div className="mp-activity-meta-row">
                {item.date && (
                  <>
                    <span className="mp-meta-item">
                      <CalendarIcon /> {item.date}
                    </span>
                    <span className="mp-meta-dot">•</span>
                  </>
                )}
                {item.time && (
                  <>
                    <span className="mp-meta-item">
                      <ClockIcon /> {item.time}
                    </span>
                    <span className="mp-meta-dot">•</span>
                  </>
                )}
                <span className="mp-status-planned">
                  <CheckIcon /> {t('planned')}
                </span>
              </div>

              <div className="mp-activity-meta-row">
                <span className="mp-meta-item">
                  <LocationIcon /> {item.location || t(item.locationKey)}
                </span>
                <span className="mp-meta-dot">•</span>
                <span className="mp-meta-item">
                  <BagIcon /> {item.cost || item.price} {t('egp')}
                </span>
              </div>
            </div>

                <div className="mp-activity-actions">
                  <Link to={`/user/activity/${itemId}`} state={{ activity: item }} className="mp-btn-action" title={t('viewDetailsLabel')}>
                    <EyeIcon />
                  </Link>
                  <button className="mp-btn-action" onClick={() => handleDelete(itemId)} title={t('delete')}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* ── Add New Activity Button ── */}
      <button className="mp-add-new-activity-btn" onClick={openAddModal}>
        <PlusIcon /> {t('addNewActivity')}
        <span className="mp-add-subtitle">{t('manageActivities')}</span>
      </button>

      {/* ── Explore More Box ── */}
      <div className="mp-explore-box">
        <div className="mp-explore-left">
          <div className="mp-bulb-icon">
            <BulbIcon />
          </div>
          <div className="mp-explore-texts">
            <h4>{t('stillHaveLeft', { remaining: remaining })}</h4>
            <p>{t('discoverMore')}</p>
          </div>
        </div>
        <Link to="/user/explore" className="mp-btn-outline-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
          {t('exploreMoreIdea')}
        </Link>
      </div>

      {/* Add Custom Activity Modal */}
      {showAddModal && (
        <div className="otp-overlay">
          <div className={`otp-popup ${closingAddModal ? 'otp-popup-closing' : ''}`} style={{ maxWidth: '400px', width: '90%', padding: '24px' }}>
            <button className="otp-close-btn" onClick={closeAddModal}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h2 style={{ marginBottom: '16px', alignSelf: 'flex-start', color: 'var(--text-main)', fontSize: '20px' }}>
              {t('addNewActivity')}
            </h2>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{t('activityName')}</label>
                <input 
                  type="text" 
                  value={newActivityTitle} 
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }}
                  placeholder="e.g. Cinema Night"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{t('amount')} ({t('egp')})</label>
                <input 
                  type="number" 
                  value={newActivityCost} 
                  onChange={(e) => setNewActivityCost(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }}
                  placeholder="e.g. 200"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{t('locationOptional')}</label>
                <input 
                  type="text" 
                  value={newActivityLocation} 
                  onChange={(e) => setNewActivityLocation(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }}
                  placeholder="e.g. Mall of Egypt"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', width: '100%' }}>
              <button 
                onClick={closeAddModal}
                disabled={addMutation.isPending}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#fff', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleAddCustomActivity}
                disabled={addMutation.isPending || !newActivityTitle || !newActivityCost}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: (!newActivityTitle || !newActivityCost) ? 0.5 : 1 }}
              >
                {addMutation.isPending ? t('saving') || 'Saving...' : t('save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      </>
      }
    </div>
  );
};

export default MyPlan;
