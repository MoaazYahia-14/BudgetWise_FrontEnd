import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivityById, getActivityReviews, createReview } from '../services/activityService';
import { addToPlan } from '../services/planService';
import { getImageUrl } from '../utils/imageUtils';
import '../styles/pages/ActivityDetails.css';



/* ==============================
   Icons
   ============================== */
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const StarIcon = ({ filled = true }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#FBBF24" : "none"} stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

/* ==============================
   Component
   ============================== */
const ActivityDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  
  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const location = useLocation();
  const activityFromState = location.state?.activity;

  // Queries
  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const res = await getActivityById(id);
      return res.data?.data;
    },
    placeholderData: activityFromState,
    enabled: !!id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      try {
        const res = await getActivityReviews(id);
        return res.data?.data || [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!id && !!activity?._id // Only fetch reviews for DB activities
  });

  // Mutations
  const reviewMutation = useMutation({
    mutationFn: (data) => createReview(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
      setNewComment('');
      setNewRating(5);
      
      setPopupMessage(t('reviewPostedSuccess', 'Review posted successfully!'));
      setIsSuccess(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || t('failedToPostReview', 'Failed to post review');
      setPopupMessage(msg);
      setIsSuccess(false);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    }
  });

  const addToPlanMutation = useMutation({
    mutationFn: addToPlan,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['myPlanItems'] });
      queryClient.invalidateQueries({ queryKey: ['myPlan'] });
      queryClient.invalidateQueries({ queryKey: ['planSummary'] });
      queryClient.invalidateQueries({ queryKey: ['myBudget'] });
      queryClient.invalidateQueries({ queryKey: ['budgetStats'] });

      setPopupMessage(res.data?.message || t('addedToPlanSuccess') || 'Added to plan successfully!');
      setIsSuccess(true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    },
    onError: (err) => {
      setPopupMessage(err?.response?.data?.message || t('failedToAdd') || 'Failed to add to plan');
      setIsSuccess(false);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2500);
    }
  });

  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    if (activity?.image) {
      setActiveImage(getImageUrl(activity.image));
    }
  }, [activity]);

  if (isLoading) return <div className="p-5">Loading Activity Details...</div>;
  if (!activity) return <div className="p-5">Activity Not Found</div>;

  const handleAddToPlan = () => {
    addToPlanMutation.mutate({
      activityId: activity._id,
      title: activity.title,
      description: activity.description,
      cost: activity.price,
      location: activity.location,
      image: activity.image,
      images: activity.images,
      rating: activity.rating
    });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    reviewMutation.mutate({ rating: newRating, comment: newComment });
  };

  const mapQuery = activity.location && activity.city 
    ? `${activity.location} ${activity.city}` 
    : activity.location || activity.city || 'Cairo';
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

  return (
    <div className="act-details-page">
      <div className="act-header">
        <div className="act-header-text">
          <h1 className="act-title">{activity.title}</h1>
          {activity.category && (
            <div style={{ marginTop: '8px' }}>
              <span style={{ background: 'rgba(108,99,255,0.1)', color: '#6C63FF', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                {activity.category === 'other' && activity.customCategory ? `Other - ${activity.customCategory}` : (activity.category.charAt(0).toUpperCase() + activity.category.slice(1))}
              </span>
            </div>
          )}
          <div className="act-meta-row" style={{ marginTop: '10px' }}>
            <span className="act-meta-item"><LocationIcon /> {activity.location}, {activity.city}</span>
            <span className="act-meta-item"><EyeIcon /> {activity.views || 0} {t('views')}</span>
            <span className="act-meta-item act-meta-rating"><StarIcon /> {activity.rating || 0} ({activity.reviewsCount || 0} {t('reviews')})</span>
          </div>
        </div>
        <button className="act-btn-primary" onClick={handleAddToPlan}>
          <PlusIcon /> {t('addToPlan')}
        </button>
      </div>

      <div className="act-content">
        <div className="act-images-col">
          <div className="act-main-img-wrapper">
            <img src={activeImage} alt={activity.title} className="act-main-img" />
          </div>
          <div className="act-thumb-row">
            {(activity.images || []).slice(0, 3).map((img, idx) => (
              <img 
                key={idx}
                src={getImageUrl(img)} 
                alt="Thumbnail" 
                className={`act-thumb ${activeImage === getImageUrl(img) ? 'active' : ''}`}
                onClick={() => setActiveImage(getImageUrl(img))}
              />
            ))}
          </div>
          
          <div className="act-section" style={{ marginTop: '30px' }}>
            <h3>{t('locationOnMap', 'Location on Map')}</h3>
            <div style={{ width: '100%', height: '300px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #eee' }}>
              <iframe 
                title="map"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                src={mapUrl}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        <div className="act-info-col">
          <div className="act-section">
            <h3>{t('aboutActivity', 'About Activity')}</h3>
            <p className="act-desc">{activity.description}</p>
          </div>

          <div className="act-section">
            <h3>{t('activityHighlights', 'Highlights')}</h3>
            <ul className="act-highlights">
              {(activity.highlights || []).length > 0 ? activity.highlights.map((hl, i) => (
                <li key={i}>{hl}</li>
              )) : (
                <>
                  <li>{t('highlight1', 'Great for families')}</li>
                  <li>{t('highlight2', 'Premium experience')}</li>
                  <li>{t('highlight3', 'Local favorites')}</li>
                </>
              )}
            </ul>
          </div>

          {/* Only show reviews for real activities (from DB) */}
          {activity?._id && !activity.isCustom && (
            <div className="act-section">
              <h3>{t('userReviews', 'User Reviews')} ({reviews.length})</h3>
              
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button type="button" key={s} onClick={() => setNewRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <StarIcon filled={s <= newRating} />
                    </button>
                  ))}
                </div>
                <textarea 
                  placeholder={t('writeReview', 'Write your experience...')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee', minHeight: '80px', marginBottom: '10px' }}
                />
                <button type="submit" disabled={reviewMutation.isLoading} className="act-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {reviewMutation.isLoading ? t('submitting', 'Submitting...') : t('submitReview', 'Submit Review')}
                </button>
              </form>

              <div className="reviews-list">
                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <strong className="review-user">{review.userId?.name || t('anonymousUser', 'Anonymous User')}</strong>
                      <div style={{ display: 'flex' }}>
                        {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= review.rating} />)}
                      </div>
                    </div>
                    <p className="act-desc">{review.comment}</p>
                  </div>
                )) : (
                  <p className="act-desc" style={{ textAlign: 'center', opacity: 0.6 }}>{t('noReviewsYet', 'Be the first to review this activity!')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
              <h2 className="otp-success-title">{isSuccess ? 'Success' : 'Info'}</h2>
              <p className="otp-success-msg">{popupMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetails;
