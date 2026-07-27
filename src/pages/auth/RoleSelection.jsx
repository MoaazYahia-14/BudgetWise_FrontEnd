import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { updateRole } from '../../services/profileService';
import '../../styles/pages/Signup.css';
import '../../styles/pages/Signup.responsive.css';
import MouseTrackingBackground from '../../components/MouseTrackingBackground';

export default function RoleSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth(); // We might need to update user context, but let's assume login() or fetchProfile does it

  const INDUSTRY_OPTIONS = [
    { value: 'technology', label: t('technology', 'Technology') },
    { value: 'food', label: t('food', 'Food & Beverage') },
    { value: 'tourism', label: t('tourism', 'Tourism & Hospitality') },
    { value: 'healthcare', label: t('healthcare', 'Healthcare & Wellness') },
    { value: 'education', label: t('education', 'Education & Training') },
    { value: 'retail', label: t('retail', 'Retail & E-commerce') },
    { value: 'entertainment', label: t('entertainment', 'Entertainment & Media') },
    { value: 'sports', label: t('sports', 'Sports & Fitness') },
    { value: 'finance', label: t('finance', 'Finance & Banking') },
    { value: 'manufacturing', label: t('manufacturing', 'Manufacturing') },
    { value: 'other', label: t('other', 'Other') },
  ];

  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    customIndustry: '',
    companyAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError(t('pleaseSelectRole', 'Please select an account type.'));
      return;
    }

    if (role === 'founder') {
      if (!formData.industry || !formData.companyAddress) {
        setError(t('fillAllFields', 'Please fill in all required fields.'));
        return;
      }
      if (formData.industry === 'other' && !formData.customIndustry.trim()) {
        setError(t('fillCustomIndustry', 'Please specify your industry.'));
        return;
      }
    }

    try {
      setLoading(true);
      const payload = { role, ...formData };
      const res = await updateRole(payload);
      
      // Update local storage or user context if needed
      // Assuming context fetches from token or we just redirect
      if (res.data?.success) {
        logout(); // مسح الجلسة وتوجيهه للوجين كما طلب العميل
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('somethingWentWrong', 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center position-relative" style={{ overflow: 'hidden', backgroundColor: '#f8fafc' }}>
      <MouseTrackingBackground />
      
      {/* Centered Form */}
      <div style={{ zIndex: 1, width: '100%', maxWidth: '500px', padding: '0 20px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img src="/images/LogoBuggetWise.png" alt="BudgetWise Logo" style={{ width: '200px', height: 'auto', marginBottom: '24px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>{t('chooseAccountType', 'Choose Account Type')}</h1>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
              {t('accountTypeDesc', 'Select the option that best describes you.')}
            </p>
          </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              
              {/* Role Selection Cards */}
              <div className="role-cards" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div 
                  className={`role-card ${role === 'user' ? 'active' : ''}`}
                  onClick={() => { setRole('user'); setError(''); }}
                  style={{ flex: 1, padding: '20px', border: role === 'user' ? '2px solid #6366f1' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', background: role === 'user' ? '#e0e7ff' : '#fff' }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>👤</div>
                  <h3 style={{ fontSize: '16px', margin: 0, color: '#1e293b' }}>{t('personal', 'Personal')}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>{t('personalDesc', 'Manage daily expenses')}</p>
                </div>

                <div 
                  className={`role-card ${role === 'founder' ? 'active' : ''}`}
                  onClick={() => { setRole('founder'); setError(''); }}
                  style={{ flex: 1, padding: '20px', border: role === 'founder' ? '2px solid #6366f1' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', background: role === 'founder' ? '#e0e7ff' : '#fff' }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏢</div>
                  <h3 style={{ fontSize: '16px', margin: 0, color: '#1e293b' }}>{t('founder', 'Founder')}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>{t('founderDesc', 'Manage business budget')}</p>
                </div>
              </div>

              {/* Founder Extra Fields */}
              {role === 'founder' && (
                <div className="founder-fields" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <div className="signup-form-group">
                    <label>{t('companyNameOptional', 'Company Name (Optional)')}</label>
                    <input
                      type="text"
                      className="signup-input"
                      placeholder={t('enterCompanyName', 'e.g. BudgetWise Corp')}
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="signup-form-group">
                    <label>{t('industry', 'Industry/Field')} <span className="required-star">*</span></label>
                    <select
                      className="signup-input"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      style={{ appearance: 'auto' }}
                    >
                      <option value="">{t('selectIndustry', 'Select Industry...')}</option>
                      {INDUSTRY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {formData.industry === 'other' && (
                    <div className="signup-form-group" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                      <label>{t('specifyIndustry', 'Specify Your Industry')} <span className="required-star">*</span></label>
                      <input
                        type="text"
                        className="signup-input"
                        placeholder={t('enterCustomIndustry', 'e.g. Agriculture, Real Estate, etc.')}
                        name="customIndustry"
                        value={formData.customIndustry}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                  <div className="signup-form-group">
                    <label>{t('companyAddress', 'Company Address')} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      className="signup-input"
                      placeholder={t('enterAddress', 'Enter business address')}
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="signup-btn-primary"
                disabled={loading || !role}
                style={{ marginTop: '16px' }}
              >
                {loading ? t('pleaseWait', 'Please wait...') : t('next', 'التالي')}
              </button>

              {error && <p className="signup-error" style={{ marginTop: '12px', textAlign: 'center' }}>{error}</p>}
            </form>

        </div>
      </div>
    </div>
  );
}
