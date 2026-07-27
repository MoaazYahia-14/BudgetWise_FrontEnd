import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DatePicker from 'react-datepicker';
import { getImageUrl } from '../utils/imageUtils';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/pages/Settings.css';

/* ==============================
   Icons
   ============================== */
const EditProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const EyeOffIcon = ({ onClick }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="set-eye-icon" onClick={onClick}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const EyeIcon = ({ onClick }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="set-eye-icon" onClick={onClick}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const DangerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

/* ==============================
   Component
   ============================== */
const Settings = () => {
  const { t } = useTranslation();
  const { user, login, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const INDUSTRY_OPTIONS = [
    { value: 'technology', label: 'Technology' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'tourism', label: 'Tourism & Hospitality' },
    { value: 'healthcare', label: 'Healthcare & Wellness' },
    { value: 'education', label: 'Education & Training' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'entertainment', label: 'Entertainment & Media' },
    { value: 'sports', label: 'Sports & Fitness' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'other', label: 'Other' },
  ];

  const [profileData, setProfileData] = useState({
    name: '',
    birthday: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
    customIndustry: '',
    companyAddress: '',
  });

  const [preferences, setPreferences] = useState({
    location: '',
    currency: '',
  });

  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  const fileInputRef = useRef(null);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [closingEditModal, setClosingEditModal] = useState(false);

  // OTP States
  const [showOTP, setShowOTP] = useState(false);
  const [closingOTP, setClosingOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [closingDeleteModal, setClosingDeleteModal] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Fetch initial profile data
  const fetchProfile = async (silent = false) => {
    try {
      if (!silent) setFetching(true);
      const res = await api.get('/profile');
      const data = res.data.data;
      setOriginalData(data);

      let formattedBirthday = '';
      if (data.birthday) {
        try { formattedBirthday = new Date(data.birthday).toISOString().split('T')[0]; }
        catch (e) { formattedBirthday = data.birthday; }
      }

      setProfileData({
        name: data.name || '',
        birthday: formattedBirthday,
        email: data.email || '',
        phone: data.phone || '',
        companyName: data.companyName || '',
        industry: data.industry || '',
        customIndustry: data.customIndustry || '',
        companyAddress: data.companyAddress || '',
      });

      setPreferences({
        location: (data.preferences?.location || data.location || 'cairo').toLowerCase(),
        currency: (data.preferences?.currency || data.currency || 'egp').toLowerCase(),
      });

      if (data.avatar) {
        setAvatarPreview(getImageUrl(data.avatar));
      } else if (user?.avatar) {
        setAvatarPreview(getImageUrl(user.avatar));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t('somethingWentWrong'));
    } finally {
      if (!silent) setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [t, user?.avatar]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = res.data.data.user || res.data.data;
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        login(updatedUser, token);
      }
      setSuccessMsg(t('avatarUpdatedSuccess') || 'Avatar updated successfully');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    // Reset inputs to original data before opening
    let formattedBirthday = '';
    if (originalData?.birthday) {
      try { formattedBirthday = new Date(originalData.birthday).toISOString().split('T')[0]; }
      catch (e) { formattedBirthday = originalData.birthday; }
    }

    setProfileData({
      name: originalData?.name || '',
      birthday: formattedBirthday,
      email: originalData?.email || '',
      phone: originalData?.phone || '',
      companyName: originalData?.companyName || '',
      industry: originalData?.industry || '',
      customIndustry: originalData?.customIndustry || '',
      companyAddress: originalData?.companyAddress || '',
    });
    setPreferences({
      location: (originalData?.preferences?.location || originalData?.location || 'cairo').toLowerCase(),
      currency: (originalData?.preferences?.currency || originalData?.currency || 'egp').toLowerCase(),
    });
    setPasswords({ newPassword: '', confirmNewPassword: '' });
    setErrorMsg('');
    setSuccessMsg('');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setClosingEditModal(true);
    setTimeout(() => {
      setShowEditModal(false);
      setClosingEditModal(false);
      setErrorMsg('');
    }, 300);
  };

  const handleSaveFromModal = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      let madeChanges = false;
      let emailChanged = false;

      // 1. Password update
      if (passwords.newPassword || passwords.confirmNewPassword) {
        if (passwords.newPassword !== passwords.confirmNewPassword) {
          throw new Error(t('passwordsNotMatch') || 'Passwords do not match');
        }
        await api.put('/profile/password', {
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmNewPassword
        });
        madeChanges = true;
      }

      // 2. Profile update
      let currentFormattedBday = '';
      if (originalData?.birthday) {
        currentFormattedBday = new Date(originalData.birthday).toISOString().split('T')[0];
      }
      if (
        profileData.name !== originalData?.name ||
        profileData.phone !== originalData?.phone ||
        profileData.birthday !== currentFormattedBday ||
        profileData.companyName !== originalData?.companyName ||
        profileData.industry !== originalData?.industry ||
        profileData.customIndustry !== (originalData?.customIndustry || '') ||
        profileData.companyAddress !== originalData?.companyAddress
      ) {
        await api.put('/profile', {
          name: profileData.name,
          phone: profileData.phone,
          birthday: profileData.birthday,
          companyName: profileData.companyName,
          industry: profileData.industry,
          customIndustry: profileData.industry === 'other' ? profileData.customIndustry : null,
          companyAddress: profileData.companyAddress,
        });
        madeChanges = true;
      }

      // 3. Preferences update
      if (
        preferences.location !== (originalData?.preferences?.location || originalData?.location || 'cairo').toLowerCase() ||
        preferences.currency !== (originalData?.preferences?.currency || originalData?.currency || 'egp').toLowerCase()
      ) {
        await api.put('/profile/preferences', preferences);
        madeChanges = true;
      }

      // 4. Email update
      if (profileData.email !== originalData?.email) {
        await api.put('/profile/email', { email: profileData.email });
        emailChanged = true;
        madeChanges = true;
      }

      // Refresh data automatically
      if (madeChanges) {
        await fetchProfile(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token && originalData) {
          login({ ...originalData, name: profileData.name, email: originalData.email }, token);
        }
      }

      if (emailChanged) {
        closeEditModal();
        setShowOTP(true);
      } else if (madeChanges) {
        setSuccessMsg(t('profileUpdatedSuccess') || 'Profile updated successfully');
        closeEditModal();
      } else {
        setSuccessMsg(t('noChangesMade') || 'No changes were made');
        closeEditModal();
      }

    } catch (err) {
      setErrorMsg(err.message || err.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setDeletePassword('');
    setDeleteError('');
    setDeleteSuccess(false);
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (user?.authProvider === 'local' && !deletePassword) {
      setDeleteError(t('passwordRequired') || 'Password is required to delete your account');
      return;
    }
    
    try {
      setLoading(true);
      setDeleteError('');
      const res = await api.delete('/profile', { 
        data: { password: deletePassword },
        skipAuthInterceptor: true
      });
      setSuccessMsg(res.data?.message || t('accountDeletedSuccess'));
      setDeleteSuccess(true);
      
      setTimeout(() => {
        logout();
      }, 2500);
    } catch (err) {
      setDeleteError(err.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification Handlers
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setOtpError(t('pleaseEnterOTP') || 'Please enter OTP');
      return;
    }
    try {
      setLoading(true);
      setOtpError('');
      await api.post('/profile/verify-email-change', {
        email: profileData.email,
        otpCode: otpCode,
      });
      setVerifySuccess(true);
      // Fetch data automatically to update the email
      await fetchProfile(true);
      setTimeout(() => {
        handleCloseOTP();
        setSuccessMsg(t('emailUpdatedSuccess') || 'Email updated successfully');
      }, 2000);
    } catch (err) {
      setOtpError(err.response?.data?.message || t('invalidOTP') || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOTP = () => {
    setClosingOTP(true);
    setTimeout(() => {
      setShowOTP(false);
      setClosingOTP(false);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setVerifySuccess(false);
    }, 300);
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`profile-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`profile-otp-${index - 1}`)?.focus();
    }
  };

  if (fetching) {
    return (
      <div className="settings-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>{t('loading') || 'Loading...'}</p>
      </div>
    );
  }

  // Format data for display
  let displayBirthday = '';
  if (originalData?.birthday) {
    try { displayBirthday = new Date(originalData.birthday).toISOString().split('T')[0]; }
    catch (e) { displayBirthday = originalData.birthday; }
  }

  return (
    <div className="settings-page">
      {/* ── Header ── */}
      <div className="set-header">
        <div className="set-header-text">
          <h1 className="set-title">{t('profileSettings')}</h1>
          <p className="set-subtitle">{t('manageAccount')}</p>
        </div>
        <button className="set-btn-edit" onClick={openEditModal}>
          <EditProfileIcon /> {t('editProfile')}
        </button>
      </div>

      {errorMsg && !showEditModal && <div style={{ color: '#DC2626', marginBottom: '16px', padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '8px' }}>{errorMsg}</div>}
      {successMsg && !showEditModal && <div style={{ color: '#059669', marginBottom: '16px', padding: '12px', backgroundColor: '#ECFDF5', borderRadius: '8px' }}>{successMsg}</div>}

      {/* ── User Info Card ── */}
      <div className="set-user-card">
        <div className="set-user-card-left">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <img 
            src={avatarPreview || "/images/user-avatar.jpg"} 
            alt="User" 
            className="set-avatar" 
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6C63FF&color=fff`; }}
          />
          <div className="set-user-info">
            <h3>{originalData?.name || user?.name || 'User'}</h3>
            <p>{originalData?.email || user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <button className="set-btn-change-photo" onClick={triggerFileInput} disabled={loading}>
          {loading ? '...' : t('changePhoto')}
        </button>
      </div>

      {/* ── Profile Section (Read-Only) ── */}
      <div className="set-section">
        <h2 className="set-section-title">{t('profile')}</h2>
        <div className="set-grid">
          <div className="set-input-group">
            <label>{t('userName')}</label>
            <input type="text" value={originalData?.name || ''} disabled />
          </div>
          <div className="set-input-group">
            <label>{t('birthday')}</label>
            <input type="date" value={displayBirthday} disabled />
          </div>
          <div className="set-input-group">
            <label>{t('emailAddress')}</label>
            <input type="email" value={originalData?.email || ''} disabled />
          </div>
          <div className="set-input-group">
            <label>{t('phoneNumber')}</label>
            <input type="tel" value={originalData?.phone || ''} disabled dir="ltr" style={{ textAlign: document.body.getAttribute('dir') === 'rtl' ? 'right' : 'left' }} />
          </div>
        </div>
      </div>

      {/* ── Founder Details Section (Read-Only) ── */}
      {user?.role === 'founder' && (
        <div className="set-section">
          <h2 className="set-section-title">{t('founderDetails')}</h2>
          <div className="set-grid">
            <div className="set-input-group">
              <label>{t('companyName')}</label>
              <input type="text" value={originalData?.companyName || ''} disabled />
            </div>
            <div className="set-input-group">
              <label>{t('industry')}</label>
              <input type="text" value={
                originalData?.industry === 'other' && originalData?.customIndustry
                  ? `Other - ${originalData.customIndustry}`
                  : (INDUSTRY_OPTIONS.find(o => o.value === originalData?.industry)?.label || originalData?.industry || '')
              } disabled />
            </div>
            <div className="set-input-group">
              <label>{t('companyAddress')}</label>
              <input type="text" value={originalData?.companyAddress || ''} disabled />
            </div>
          </div>
        </div>
      )}

      {/* ── Preferences Section (Read-Only) ── */}
      <div className="set-section" style={{ marginBottom: '40px' }}>
        <h2 className="set-section-title">{t('preferences')}</h2>
        <div className="set-grid">
          <div className="set-input-group">
            <label>{t('location')}</label>
            <div className="set-select-wrapper">
              <select value={(originalData?.preferences?.location || originalData?.location || 'cairo').toLowerCase()} disabled>
                <option value="cairo">Cairo, Egypt</option>
                <option value="dubai">Dubai, UAE</option>
                <option value="london">London, UK</option>
                <option value="new_york">New York, USA</option>
              </select>
              <ChevronDownIcon className="set-select-icon" />
            </div>
          </div>
          <div className="set-input-group">
            <label>{t('currency')}</label>
            <div className="set-select-wrapper">
              <select value={(originalData?.preferences?.currency || originalData?.currency || 'egp').toLowerCase()} disabled>
                <option value="egp">EGP</option>
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
              </select>
              <ChevronDownIcon className="set-select-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="set-danger-zone">
        <div className="set-danger-left">
          <DangerIcon />
          <div className="set-danger-text">
            <h3>{t('dangerZone')}</h3>
            <p>{t('deleteAccountWarning')}</p>
          </div>
        </div>
        <button className="set-btn-delete" onClick={handleDeleteAccountClick} disabled={loading}>
          {loading ? '...' : t('deleteAccount')}
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="otp-overlay">
          <div className={`otp-popup ${closingEditModal ? 'otp-popup-closing' : ''}`} style={{ maxWidth: '600px', width: '90%' }}>
            <button className="otp-close-btn" onClick={closeEditModal}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h2 style={{ marginBottom: '8px', alignSelf: 'flex-start' }}>{t('editProfile')}</h2>
            
            {errorMsg && <div style={{ width: '100%', color: '#DC2626', marginBottom: '8px', padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '8px', textAlign: 'left', fontSize: '14px' }}>{errorMsg}</div>}

            <div className="set-edit-form" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
              <div className="set-grid">
                <div className="set-input-group">
                  <label>{t('userName')}</label>
                  <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} />
                </div>
                <div className="set-input-group">
                  <label>{t('birthday')}</label>
                  <DatePicker
                    selected={profileData.birthday ? new Date(profileData.birthday) : null}
                    onChange={(date) => {
                      if (date) {
                        const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        setProfileData({ ...profileData, birthday: formatted });
                      } else {
                        setProfileData({ ...profileData, birthday: '' });
                      }
                    }}
                    dateFormat="yyyy-MM-dd"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    maxDate={new Date()}
                    placeholderText="YYYY-MM-DD"
                  />
                </div>
                <div className="set-input-group">
                  <label>{t('emailAddress')}</label>
                  <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} />
                </div>
                <div className="set-input-group">
                  <label>{t('phoneNumber')}</label>
                  <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} dir="ltr" style={{ textAlign: document.body.getAttribute('dir') === 'rtl' ? 'right' : 'left' }} />
                </div>
              </div>

              {user?.role === 'founder' && (
                <>
                  <h3 style={{ fontSize: '16px', margin: '8px 0 0', alignSelf: 'flex-start', color: 'var(--text-main)' }}>{t('founderDetails')}</h3>
                  <div className="set-grid">
                    <div className="set-input-group">
                      <label>{t('companyName')}</label>
                      <input type="text" name="companyName" value={profileData.companyName} onChange={handleProfileChange} />
                    </div>
                    <div className="set-input-group">
                      <label>{t('industry')}</label>
                      <div className="set-select-wrapper">
                        <select name="industry" value={profileData.industry} onChange={handleProfileChange}>
                          <option value="">{t('selectIndustry', 'Select Industry...')}</option>
                          {INDUSTRY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDownIcon className="set-select-icon" />
                      </div>
                    </div>
                    {profileData.industry === 'other' && (
                      <div className="set-input-group" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <label>{t('specifyIndustry', 'Specify Your Industry')}</label>
                        <input type="text" name="customIndustry" value={profileData.customIndustry} onChange={handleProfileChange} placeholder={t('enterCustomIndustry', 'e.g. Agriculture, Real Estate, etc.')} />
                      </div>
                    )}
                    <div className="set-input-group">
                      <label>{t('companyAddress')}</label>
                      <input type="text" name="companyAddress" value={profileData.companyAddress} onChange={handleProfileChange} />
                    </div>
                  </div>
                </>
              )}

              <h3 style={{ fontSize: '16px', margin: '8px 0 0', alignSelf: 'flex-start', color: 'var(--text-main)' }}>{t('preferences')}</h3>
              <div className="set-grid">
                <div className="set-input-group">
                  <label>{t('location')}</label>
                  <div className="set-select-wrapper">
                    <select name="location" value={preferences.location} onChange={handlePreferenceChange}>
                      <option value="cairo">Cairo, Egypt</option>
                      <option value="dubai">Dubai, UAE</option>
                      <option value="london">London, UK</option>
                      <option value="new_york">New York, USA</option>
                    </select>
                    <ChevronDownIcon className="set-select-icon" />
                  </div>
                </div>
                <div className="set-input-group">
                  <label>{t('currency')}</label>
                  <div className="set-select-wrapper">
                    <select name="currency" value={preferences.currency} onChange={handlePreferenceChange}>
                      <option value="egp">EGP</option>
                      <option value="usd">USD</option>
                      <option value="eur">EUR</option>
                      <option value="gbp">GBP</option>
                    </select>
                    <ChevronDownIcon className="set-select-icon" />
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', margin: '8px 0 0', alignSelf: 'flex-start', color: 'var(--text-main)' }}>{t('security')}</h3>
              <div className="set-grid">
                <div className="set-input-group">
                  <label>{t('newPassword')}</label>
                  <div className="set-password-wrapper">
                    <input type={showNewPassword ? "text" : "password"} name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} placeholder="*********" />
                    {showNewPassword ? <EyeIcon onClick={() => setShowNewPassword(false)} /> : <EyeOffIcon onClick={() => setShowNewPassword(true)} />}
                  </div>
                </div>
                <div className="set-input-group">
                  <label>{t('confirmNewPassword')}</label>
                  <div className="set-password-wrapper">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmNewPassword" value={passwords.confirmNewPassword} onChange={handlePasswordChange} placeholder="*********" />
                    {showConfirmPassword ? <EyeIcon onClick={() => setShowConfirmPassword(false)} /> : <EyeOffIcon onClick={() => setShowConfirmPassword(true)} />}
                  </div>
                </div>
              </div>
            </div>

            <div className="delete-modal-actions">
              <button className="set-btn-cancel" onClick={closeEditModal} disabled={loading}>{t('cancel')}</button>
              <button className="set-btn-save" onClick={handleSaveFromModal} disabled={loading}>
                {loading ? t('saving') || 'Saving...' : t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Popup for Email Verification */}
      {showOTP && (
        <div className="otp-overlay">
          <div className={`otp-popup ${closingOTP ? 'otp-popup-closing' : ''}`}>
            {!verifySuccess && (
              <button className="otp-close-btn" onClick={handleCloseOTP}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}

            {verifySuccess ? (
              <div className="otp-success-screen">
                <img src="/images/LogoBuggetWise.png" alt="BudgetWise" className="otp-success-logo" width="160" height="auto" />
                <div className="otp-checkmark">
                  <svg viewBox="0 0 52 52" className="otp-checkmark-svg">
                    <circle className="otp-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="otp-checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
                <h2 className="otp-success-title">{t('verified') || 'Verified'}</h2>
                <p className="otp-success-msg">{t('emailUpdatedSuccess') || 'Email successfully verified and updated.'}</p>
              </div>
            ) : (
              <>
                <div className="otp-icon">✉️</div>
                <h2>{t('verifyEmail')}</h2>
                <p className="otp-subtitle">
                  {t('verifySubtitle')}<br />
                  <strong>{profileData.email}</strong>
                </p>
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`profile-otp-${index}`}
                      type="text"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      maxLength={1}
                    />
                  ))}
                </div>
                {otpError && <p className="otp-error">{otpError}</p>}
                <button className="otp-btn" onClick={handleVerifyOTP} disabled={loading}>
                  {loading ? t('verifying') || 'Verifying...' : t('verify')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="otp-overlay">
          <div className={`otp-popup ${closingDeleteModal ? 'otp-popup-closing' : ''}`}>
            {!deleteSuccess && (
              <button className="otp-close-btn" onClick={() => {
                setClosingDeleteModal(true);
                setTimeout(() => { setShowDeleteModal(false); setClosingDeleteModal(false); }, 300);
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}

            {deleteSuccess ? (
              <div className="otp-success-screen">
                <img src="/images/LogoBuggetWise.png" alt="BudgetWise" className="otp-success-logo" width="160" height="auto" />
                <div className="otp-checkmark">
                  <svg viewBox="0 0 52 52" className="otp-checkmark-svg">
                    <circle className="otp-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="otp-checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
                <h2 className="otp-success-title">{t('deleted')}</h2>
                <p className="otp-success-msg">{successMsg || t('accountDeletedSuccess')}</p>
              </div>
            ) : (
              <>
                <div className="otp-icon" style={{ color: '#DC2626' }}>
                  <DangerIcon />
                </div>
                <h2>{t('confirmDelete')}</h2>
                <p className="otp-subtitle">{t('deleteAccountWarning')}</p>
                
                {user?.authProvider === 'local' && (
                  <div className="set-input-group" style={{ width: '100%', textAlign: 'left', marginTop: '16px' }}>
                    <label>{t('password')} <span className="required-star">*</span></label>
                    <input 
                      type="password" 
                      className="login-input" 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }}
                      placeholder={t('enterPassword') || 'Enter Password...'} 
                      value={deletePassword} 
                      onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }} 
                    />
                  </div>
                )}
                
                {deleteError && <p className="otp-error">{deleteError}</p>}
                
                <div className="delete-modal-actions">
                  <button className="set-btn-cancel" onClick={() => {
                    setClosingDeleteModal(true);
                    setTimeout(() => { setShowDeleteModal(false); setClosingDeleteModal(false); }, 300);
                  }}>
                    {t('no')}
                  </button>
                  <button className="set-btn-delete" style={{ borderRadius: '8px', border: 'none', background: '#DC2626', color: 'white', fontWeight: '600' }} onClick={confirmDeleteAccount} disabled={loading}>
                    {loading ? '...' : t('yes')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
