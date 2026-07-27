import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config';
import { getImageUrl } from '../../utils/imageUtils';
import '../../styles/pages/founder/FounderDashboard.css';
import '../../styles/pages/founder/FounderPosts.css';

/* Icons */
const DangerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PostsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const EyeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const AddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const FounderDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Founder';

  const [showToast, setShowToast] = useState(false);
  const [currentNotif, setCurrentNotif] = useState(null);

  useEffect(() => {
    if (user?._id) {
      const socket = io(SOCKET_URL);
      socket.emit('join', user._id);
      socket.on('notification', (notif) => {
        setCurrentNotif(notif);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
        queryClient.invalidateQueries({ queryKey: ['founderPosts'] });
      });
      return () => socket.disconnect();
    }
  }, [user?._id, queryClient]);
  
  // Queries
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['founderPosts'],
    queryFn: async () => (await api.get('/activities/my-posts')).data?.data
  });

  const stats = posts.reduce((acc, p) => ({
    totalViews: acc.totalViews + (p.views || 0),
    totalSaves: acc.totalSaves + (p.saves || 0),
    avgRating: acc.avgRating + (p.rating || 0),
    totalPosts: acc.totalPosts + 1
  }), { totalViews: 0, totalSaves: 0, avgRating: 0, totalPosts: 0 });

  if (stats.totalPosts > 0) {
    stats.avgRating = (stats.avgRating / stats.totalPosts).toFixed(1);
  }

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/activities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['founderPosts'] });
      setShowDeleteConfirm(false);
    }
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);



  return (
    <div className="founder-dashboard">
      {/* Toast Notification */}
      {showToast && currentNotif && (
        <div className="fd-notification-toast">
          <div className="fd-toast-icon">🔔</div>
          <div className="fd-toast-content">
            <strong>{t('newInteraction', 'New Interaction!')}</strong>
            <p>{currentNotif.message}</p>
          </div>
          <button onClick={() => setShowToast(false)}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="fd-header">
        <div className="fd-header-text">
          <h1 className="fd-title">{t('welcomeFounder', { name: firstName })}</h1>
          <p className="fd-subtitle">{t('founderDashboardSub', { company: user?.companyName })}</p>
        </div>
        <button className="fd-btn-primary" onClick={() => navigate('/founder/posts')}>
          <AddIcon /> {t('addPost', 'Add New Post')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="fd-kpi-cards">
        <div className="fd-kpi-card">
          <div className="fd-kpi-header">
            <div className="fd-kpi-icon bg-primary-soft"><PostsIcon /></div>
            <span className="fd-kpi-badge positive">+{posts.length}</span>
          </div>
          <div className="fd-kpi-value">{posts.length}</div>
          <p className="fd-kpi-label">{t('totalPosts', 'Total Posts')}</p>
        </div>

        <div className="fd-kpi-card">
          <div className="fd-kpi-header">
            <div className="fd-kpi-icon bg-primary-mid"><EyeIcon /></div>
            <span className="fd-kpi-badge positive">+{Math.round(stats.totalViews * 0.15)}</span>
          </div>
          <div className="fd-kpi-value">{stats.totalViews}</div>
          <p className="fd-kpi-label">{t('totalViews', 'Total Views')}</p>
        </div>

        <div className="fd-kpi-card">
          <div className="fd-kpi-header">
            <div className="fd-kpi-icon bg-primary-deep"><BookmarkIcon /></div>
            <span className="fd-kpi-badge positive">+{stats.totalSaves}</span>
          </div>
          <div className="fd-kpi-value">{stats.totalSaves}</div>
          <p className="fd-kpi-label">{t('totalSaves', 'Total Saves')}</p>
        </div>

        <div className="fd-kpi-card">
          <div className="fd-kpi-header">
            <div className="fd-kpi-icon bg-orange"><StarIcon /></div>
            <span className="fd-kpi-badge positive">{stats.avgRating}</span>
          </div>
          <div className="fd-kpi-value">{stats.avgRating} <span style={{fontSize: '18px'}}>★</span></div>
          <p className="fd-kpi-label">{t('avgRating', 'Avg. Rating')}</p>
        </div>
      </div>

      {/* Visual Analytics Chart */}
      {!isLoading && posts.length > 0 && (
        <div className="fd-analytics-card">
          <div className="fd-section-header">
            <h2 className="fd-section-title">{t('engagementOverview', 'Engagement Overview (Views)')}</h2>
          </div>
          <div className="fd-chart-container">
            {posts.slice(0, 7).map((post, idx) => {
              const maxViews = Math.max(...posts.map(p => p.views || 0), 10);
              const heightPercentage = ((post.views || 0) / maxViews) * 100;
              return (
                <div key={post._id} className="fd-chart-bar-wrapper">
                  <div className="fd-chart-bar-hint">{post.views || 0}</div>
                  <div 
                    className="fd-chart-bar" 
                    style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                  ></div>
                  <div className="fd-chart-bar-label">{post.title.substring(0, 8)}...</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="fd-section-header">
        <h2 className="fd-section-title">{t('quickActions', 'Quick Actions')}</h2>
      </div>
      <div className="fd-actions-grid">
        <div className="fd-action-item" onClick={() => navigate('/founder/posts')}>
          <div className="fd-action-icon"><AddIcon /></div>
          <div className="fd-action-content">
            <h3>{t('createPost', 'Create Post')}</h3>
            <p>{t('createPostDesc', 'Publish a new activity or service.')}</p>
          </div>
          <ArrowRightIcon />
        </div>
        <div className="fd-action-item" onClick={() => navigate('/founder/home')}>
          <div className="fd-action-icon"><UsersIcon /></div>
          <div className="fd-action-content">
            <h3>{t('communityFeed', 'Community Feed')}</h3>
            <p>{t('communityFeedDesc', 'See what other founders are posting.')}</p>
          </div>
          <ArrowRightIcon />
        </div>
        <div className="fd-action-item" onClick={() => navigate('/founder/settings')}>
          <div className="fd-action-icon"><UsersIcon /></div>
          <div className="fd-action-content">
            <h3>{t('profileSettings', 'Profile Settings')}</h3>
            <p>{t('profileSettingsDesc', 'Manage your company profile.')}</p>
          </div>
          <ArrowRightIcon />
        </div>
      </div>

      {/* Posts Tracking */}
      <div className="fd-posts-section">
        <div className="fd-section-header">
          <h2 className="fd-section-title">{t('performanceTracking', 'Performance Tracking')}</h2>
        </div>
        
        {isLoading ? (
          <div className="fd-loading">{t('loadingAnalytics', 'Loading Analytics...')}</div>
        ) : posts.length === 0 ? (
          <div className="fd-empty-state">
             <div className="fd-empty-icon">📊</div>
             <h3>{t('noDataYet', 'No Data Yet')}</h3>
             <p>{t('noDataYetDesc', 'Create your first post to start tracking performance.')}</p>
          </div>
        ) : (
          <div className="fd-posts-grid">
            {posts.map(post => (
              <div key={post._id} className="fd-post-card">
                <div className="fd-post-img-container">
                   <img src={getImageUrl(post.image)} alt={post.title} className="fd-post-img" />
                </div>
                <div className="fd-post-content">
                  <h3 className="fd-post-title">{post.title}</h3>
                  <div className="fd-analytics-row">
                    <span title="Views"><EyeIcon /> {post.views || 0}</span>
                    <span title="Saves"><BookmarkIcon /> {post.saves || 0}</span>
                    <span title="Rating"><StarIcon /> {post.rating || 0}</span>
                  </div>
                  <div className="fd-post-actions-v2">
                    <button className="fd-post-btn fd-btn-view-details" onClick={() => navigate(`/founder/post/${post._id}`, { state: { activity: post } })}>
                      <ArrowRightIcon /> {t('viewDetails', 'View Details')}
                    </button>
                    <button className="fd-post-btn fd-btn-delete-v2" onClick={() => { setPostToDelete(post); setShowDeleteConfirm(true); }}>
                      <DangerIcon /> {t('delete', 'Delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="otp-overlay">
          <div className="otp-popup">
             <div className="otp-icon" style={{ color: '#DC2626' }}><DangerIcon /></div>
             <h2>{t('confirmDelete', 'Are you sure?')}</h2>
             <p>{t('confirmDeleteDesc', 'This action cannot be undone. All analytics for this post will be lost.')}</p>
             <div className="delete-modal-actions">
                <button className="otp-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>{t('cancel', 'Cancel')}</button>
                <button className="otp-btn-confirm" style={{ backgroundColor: '#DC2626', color: 'white' }} onClick={() => deleteMutation.mutate(postToDelete._id)}>
                  {deleteMutation.isLoading ? t('deleting', 'Deleting...') : t('yesDelete', 'Yes, Delete')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderDashboard;
