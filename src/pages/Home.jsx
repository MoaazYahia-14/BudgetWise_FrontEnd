import React, { useState, useEffect } from 'react';
import { getMyPlan, getPlanSummary, addToPlan } from '../services/planService';
import { getMyBudget, createBudget, updateBudget, getBudgetStats } from '../services/budgetService';
import { getRecommendedActivities } from '../services/activityService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import FounderDashboard from './founder/FounderDashboard';
import '../styles/pages/Home.css';

/* ==================================
   أيقونات
   ================================== */
const TotalBudgetIcon = ({ width = 16, height = 16 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
    <circle cx="12" cy="12" r="2"></circle>
    <path d="M6 12h.01M18 12h.01"></path>
  </svg>
);

const PlannedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const RemainingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SetBudgetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const AiPlanIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const AddActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ==================================
   مكون الصفحة الرئيسية
   ================================== */
const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  const [showEditModal, setShowEditModal] = useState(false);
  const [closingEditModal, setClosingEditModal] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editPeriod, setEditPeriod] = useState('monthly');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  // Queries
  const { data: summaryData } = useQuery({
    queryKey: ['planSummary'],
    queryFn: async () => (await getPlanSummary()).data?.data,
    enabled: !!user && user.role !== 'founder'
  });

  const { data: statsData } = useQuery({
    queryKey: ['budgetStats'],
    queryFn: async () => (await getBudgetStats()).data?.data,
    enabled: !!user && user.role !== 'founder'
  });

  const { data: budgetData } = useQuery({
    queryKey: ['myBudget'],
    queryFn: async () => (await getMyBudget()).data?.data,
    enabled: !!user && user.role !== 'founder'
  });

  const { data: recommendedData } = useQuery({
    queryKey: ['recommendedActivities'],
    queryFn: async () => {
      // Fetch latest 3 activities from explore/all activities endpoint
      const res = await api.get('/activities?sort=recent&limit=3');
      return Array.isArray(res.data?.data?.activities) ? res.data.data.activities : [];
    },
    enabled: !!user && user.role !== 'founder'
  });

  const { data: planData } = useQuery({
    queryKey: ['myPlan'],
    queryFn: async () => {
      const res = await getMyPlan();
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
    enabled: !!user && user.role !== 'founder'
  });

  // Mutations
  const budgetMutation = useMutation({
    mutationFn: async ({ id, amount, period, isUpdate }) => {
      if (isUpdate) return updateBudget(id, { amount, period });
      return createBudget({ amount, period, currency: 'EGP' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBudget'] });
      queryClient.invalidateQueries({ queryKey: ['budgetStats'] });
      queryClient.invalidateQueries({ queryKey: ['planSummary'] });
      closeEditModal();
      setPopupMessage(t('budgetSaved', 'Budget saved successfully!'));
      setIsSuccess(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Failed to save budget';
      setPopupMessage(msg);
      setIsSuccess(false);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    }
  });

  const addToPlanMutation = useMutation({
    mutationFn: addToPlan,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['myPlan'] });
      queryClient.invalidateQueries({ queryKey: ['planSummary'] });
      queryClient.invalidateQueries({ queryKey: ['budgetStats'] });
      queryClient.invalidateQueries({ queryKey: ['myBudget'] });
      setPopupMessage(res.data?.message || t('addedToPlanSuccess') || 'Added to plan successfully!');
      setIsSuccess(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    },
    onError: (err) => {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      setPopupMessage(status === 409 ? (msg || t('alreadyInPlan') || 'Already in your plan!') : (msg || t('failedToAdd') || 'Failed to add to plan'));
      setIsSuccess(false);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    }
  });

  const totalBudget = budgetData?.amount ?? summaryData?.totalBudget ?? 0;
  const spent       = budgetData?.spent ?? statsData?.totalSpent ?? summaryData?.spent ?? 0;
  const remaining   = budgetData?.hasBudget ? (totalBudget - spent) : (summaryData?.remaining ?? (totalBudget - spent));

  const spentPercent = totalBudget > 0 ? Math.min(Math.round((spent / totalBudget) * 100), 100) : 0;
  const remainPercent = totalBudget > 0 ? Math.min(Math.round((remaining / totalBudget) * 100), 100) : 0;

  const openEditModal = () => {
    setEditAmount(budgetData?.amount || '');
    setEditPeriod(budgetData?.period || 'monthly');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setClosingEditModal(true);
    setTimeout(() => {
      setShowEditModal(false);
      setClosingEditModal(false);
    }, 300);
  };

  const handleSaveBudget = () => {
    if (!editAmount) return;
    budgetMutation.mutate({
      id: budgetData?._id,
      amount: Number(editAmount),
      period: editPeriod,
      isUpdate: !!(budgetData?.hasBudget && budgetData?._id)
    });
  };

  const handleAddToPlan = (act) => {
    const payload = {
      activityId: String(act._id || act.id),
      title: act.title,
      description: act.description || '',
      cost: Number(act.price) || 0,
      location: act.city || act.location || '',
      image: act.image || '',
      images: act.images || [],
      rating: act.rating || 0,
    };
    addToPlanMutation.mutate(payload);
  };

  return (
    <div className="home-page">
      {/* Header */}
      <div className="home-header">
        <div>
          <h1 className="home-title">{t('welcomeBackUser', { name: firstName })}</h1>
          <p className="home-subtitle">{t('planSmarter')}</p>
        </div>
        <button className="btn-edit-budget" onClick={openEditModal}>
          <EditIcon />
          {t('editBudget')}
        </button>
      </div>

      {/* Budget Cards */}
      <div className="budget-cards">
        {/* Card 1: Total Budget */}
        <div className="budget-card">
          <div className="budget-card-header">
            <div className="budget-card-icon-title">
              <div className="budget-icon bg-grey">
                <TotalBudgetIcon width={20} height={20} />
              </div>
              <span className="budget-card-title">{t('totalBudget')}</span>
            </div>
            <span className="budget-pill pill-grey">{t('forThisPlan')}</span>
          </div>
          <div className="budget-amount">
            {totalBudget.toLocaleString()} <span className="budget-currency">{t('egp')}</span>
          </div>
          <p className="budget-desc">{t('yourTotalBudget')}</p>
        </div>

        {/* Card 2: Planned */}
        <div className="budget-card">
          <div className="budget-card-header">
            <div className="budget-card-icon-title">
              <div className="budget-icon bg-purple">
                <PlannedIcon />
              </div>
              <span className="budget-card-title">{t('planned')}</span>
            </div>
            <span className="budget-pill pill-purple">{t('vsPlanned')}</span>
          </div>
          <div className="budget-amount">
            {spent.toLocaleString()} <span className="budget-currency">{t('egp')}</span>
          </div>
          <div className="budget-progress-container">
            <div className="budget-progress-bar">
              <div className="budget-progress-fill fill-purple" style={{ width: `${spentPercent}%` }}></div>
            </div>
            <p className="budget-desc">{t('plannedPercent', { percent: spentPercent })}</p>
          </div>
        </div>

        {/* Card 3: Remaining */}
        <div className="budget-card">
          <div className="budget-card-header">
            <div className="budget-card-icon-title">
              <div className="budget-icon bg-orange">
                <RemainingIcon />
              </div>
              <span className="budget-card-title">{t('remaining')}</span>
            </div>
            <span className="budget-pill pill-orange">{t('vsLastPlan')}</span>
          </div>
          <div className="budget-amount">
            {remaining.toLocaleString()} <span className="budget-currency">{t('egp')}</span>
          </div>
          <div className="budget-progress-container">
            <div className="budget-progress-bar">
              <div className="budget-progress-fill fill-orange" style={{ width: `${remainPercent}%` }}></div>
            </div>
            <p className="budget-desc">{t('remainingPercent', { percent: remainPercent })}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <div>
          <h2 className="section-title">{t('quickActions')}</h2>
          <p className="section-subtitle">{t('getThingsDone')}</p>
        </div>
      </div>

      <div className="quick-actions-cards">
        <Link to="/user/budget" className="action-card">
          <div className="action-card-left">
            <div className="action-icon">
              <SetBudgetIcon />
            </div>
            <div className="action-text">
              <h4>{t('setBudget')}</h4>
              <p>{t('setBudgetDesc')}</p>
            </div>
          </div>
          <div className="action-arrow">
            <ArrowRightIcon />
          </div>
        </Link>

        <Link to="/user/chat" className="action-card">
          <div className="action-card-left">
            <div className="action-icon">
              <AiPlanIcon />
            </div>
            <div className="action-text">
              <h4>{t('aiPlan')}</h4>
              <p>{t('aiPlanDesc')}</p>
            </div>
          </div>
          <div className="action-arrow">
            <ArrowRightIcon />
          </div>
        </Link>

        <Link to="/user/explore" className="action-card">
          <div className="action-card-left">
            <div className="action-icon">
              <AddActivityIcon />
            </div>
            <div className="action-text">
              <h4>{t('addActivity')}</h4>
              <p>{t('addActivityDesc')}</p>
            </div>
          </div>
          <div className="action-arrow">
            <ArrowRightIcon />
          </div>
        </Link>
      </div>

      {/* Recommended for you */}
      <div className="section-header">
        <div>
          <h2 className="section-title">{t('recommended')}</h2>
          <p className="section-subtitle">{t('basedOnBudget')}</p>
        </div>
        <Link to="/user/explore" className="link-view-all">
          {t('viewAll')} <ArrowRightIcon />
        </Link>
      </div>

      <div className="recommended-cards">
        {recommendedData?.map((act) => (
          <div key={act._id} className="rec-card">
            <div className="rec-img-wrapper">
              <img
                src={getImageUrl(act.image)}
                alt={act.title}
                className="rec-img"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(act.title)}&background=6C63FF&color=fff&size=400`; }}
              />
              <button className="btn-fav"><HeartIcon /></button>
            </div>
            <div className="rec-content">
              <h3 className="rec-title">{act.title}</h3>
              <div className="rec-info">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TotalBudgetIcon /> {(act.price || 0).toLocaleString()} {t('egp')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <LocationIcon /> {act.city || act.location || t('cairo')}
                </span>
              </div>
              <button className="btn-add-plan" onClick={() => handleAddToPlan(act)}>
                {t('addToPlan')}
              </button>
            </div>
          </div>
        ))}
        {(!recommendedData || recommendedData.length === 0) && (
          <p className="notif-empty" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
            {t('noActivitiesYet', 'No activities found. Check back later!')}
          </p>
        )}
      </div>

      {planData?.length > 0 && (
        <>
          <div className="section-header">
            <div>
              <h2 className="section-title">{t('myPlan')}</h2>
              <p className="section-subtitle">{t('yourSelectedActivities')}</p>
            </div>
            <Link to="/user/plan" className="link-view-all">
              {t('viewFullPlan')} <ArrowRightIcon />
            </Link>
          </div>

          <div className="plan-items">
            {planData.slice(0, 3).map((item, idx) => (
              <div key={item._id || idx} className="plan-item">
                <div className="plan-item-left">
                  <img
                    src={getImageUrl(item.image || item.img)}
                    alt={item.title}
                    className="plan-item-img"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title || 'Activity')}&background=6C63FF&color=fff&size=200`; }}
                  />
                  <div className="plan-item-text">
                    <h4>{item.title}</h4>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TotalBudgetIcon /> {(item.cost || item.price || 0).toLocaleString()} {t('egp')}
                    </p>
                  </div>
                </div>
                <div className="plan-item-status">
                  <CheckIcon /> {t('planned')}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Budget Modal */}
      {showEditModal && (
        <div className="otp-overlay">
          <div className={`otp-popup ${closingEditModal ? 'otp-popup-closing' : ''}`} style={{ maxWidth: '400px', width: '90%', padding: '24px' }}>
            <button className="otp-close-btn" onClick={closeEditModal}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h2 style={{ marginBottom: '16px', alignSelf: 'flex-start', color: 'var(--text-main)', fontSize: '20px' }}>
              {t('setBudget')}
            </h2>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{t('amount')} ({t('egp')})</label>
                <input 
                  type="number" 
                  value={editAmount} 
                  onChange={(e) => setEditAmount(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--background)', color: 'var(--text-main)' }}
                  placeholder="e.g. 3000"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{t('period')}</label>
                <select 
                  value={editPeriod} 
                  onChange={(e) => setEditPeriod(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--background)', color: 'var(--text-main)' }}
                >
                  <option value="daily">{t('daily')}</option>
                  <option value="weekly">{t('weekly')}</option>
                  <option value="monthly">{t('monthly')}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', width: '100%' }}>
              <button 
                onClick={closeEditModal}
                disabled={budgetMutation.isPending}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleSaveBudget}
                disabled={budgetMutation.isPending}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                {budgetMutation.isPending ? t('saving') || 'Saving...' : t('save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Plan Popup */}
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
                <div style={{ fontSize: '48px' }}>⚠️</div>
              )}
              <h2 className="otp-success-title">{isSuccess ? (t('added') || 'Added!') : (t('info') || 'Info')}</h2>
              <p className="otp-success-msg">{popupMessage}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
