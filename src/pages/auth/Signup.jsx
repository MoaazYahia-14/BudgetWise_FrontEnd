/* صفحة إنشاء الحساب — تحتوي على نموذج التسجيل بجانب صورة ترويجية */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SOCKET_URL } from '../../config';
import '../../styles/pages/Signup.css';
import '../../styles/pages/Signup.responsive.css';
import MouseTrackingBackground from '../../components/MouseTrackingBackground';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

/* أيقونة جوجل SVG */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </g>
    </svg>
  );
}

/* أيقونة فيسبوك SVG */
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" fill="#1877F2"/>
    </svg>
  );
}

/* المكون الرئيسي لصفحة إنشاء الحساب */
export default function Signup() {
  const { t } = useTranslation();
  const { login } = useAuth();

  /* حالة بيانات الفورم */
  const [formData, setFormData] = useState({
    name: localStorage.getItem('pendingName') || '',
    email: localStorage.getItem('pendingEmail') || '',
    password: '',
    confirmPassword: '',
  });

  /* حالة إظهار كلمات المرور */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* حالة الـ OTP Popup */
  const [showOTP, setShowOTP] = useState(
    localStorage.getItem('pendingOTP') === 'true'
  );

  /* حالة الـ OTP المدخل */
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  /* حالة التحميل */
  const [loading, setLoading] = useState(false);

  /* حالة الأخطاء */
  const [error, setError] = useState('');

  /* حالة إغلاق الـ OTP popup */
  const [closingOTP, setClosingOTP] = useState(false);

  /* حالة النجاح للتحقق */
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /* حالة رسالة خطأ الـ OTP */
  const [otpError, setOtpError] = useState('');

  /* حالة العد التنازلي لإعادة الإرسال */
  const [resendTimer, setResendTimer] = useState(60);

  /* حالة تفعيل زر إعادة الإرسال */
  const [canResend, setCanResend] = useState(false);

  /* حالة تحميل إعادة الإرسال */
  const [resendLoading, setResendLoading] = useState(false);

  /* رسالة نجاح إعادة الإرسال */
  const [resendSuccess, setResendSuccess] = useState('');

  /* ربط الـ navigate */
  const navigate = useNavigate();

  /* دالة تحديث بيانات الفورم */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  /* دالة التسجيل - تبعت البيانات للـ API */
  const handleSignup = async () => {
    setError('');
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsNotMatch'));
      return;
    }
    if (formData.password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      localStorage.setItem('pendingOTP', 'true');
      localStorage.setItem('pendingEmail', formData.email);
      localStorage.setItem('pendingName', formData.name);
      setShowOTP(true);
    } catch (err) {
      setError(err.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  /* دالة التحقق من الـ OTP مع انميشن النجاح */
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setOtpError(t('pleaseEnterOTP'));
      return;
    }
    try {
      setLoading(true);
      setOtpError('');
      const response = await api.post('/auth/verify-otp', {
        email: formData.email,
        otpCode: otpCode,
      });
      /* مسح بيانات الـ OTP من localStorage */
      localStorage.removeItem('pendingOTP');
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('pendingName');
      /* إظهار انميشن النجاح */
      const message = response.data?.message || t('emailVerified');
      setSuccessMessage(message);
      setVerifySuccess(true);
      
      /* Login the user so they can access Role Selection */
      if (response.data?.data?.user && response.data?.data?.token) {
        login(response.data.data.user, response.data.data.token);
      }

      /* الانتقال لصفحة الرول بعد ثانيتين */
      setTimeout(() => {
        navigate('/role-selection');
      }, 2500);
    } catch (err) {
      setOtpError(err.response?.data?.message || t('invalidOTP'));
    } finally {
      setLoading(false);
    }
  };

  /* دالة إغلاق الـ OTP popup بأنميشن */
  const handleCloseOTP = () => {
    setClosingOTP(true);
    setTimeout(() => {
      setShowOTP(false);
      setClosingOTP(false);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      setResendSuccess('');
    }, 300);
  };

  /* دالة التعامل مع إدخال الـ OTP في الخانات */
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  /* دالة التعامل مع الـ Backspace في خانات الـ OTP */
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  /* دالة التعامل مع اللصق (Paste) في خانات الـ OTP */
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const nextFocusIndex = pastedData.length < 6 ? pastedData.length : 5;
    const nextInput = document.getElementById(`otp-${nextFocusIndex}`);
    if (nextInput) nextInput.focus();
  };

  /* عداد تنازلي لإعادة إرسال الـ OTP */
  useEffect(() => {
    let interval;
    if (showOTP) {
      setResendTimer(60);
      setCanResend(false);
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOTP]);

  /* منع الرجوع للخلف حتى يتم تأكيد الـ OTP */
  useEffect(() => {
    if (showOTP) {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [showOTP]);

  /* دالة إعادة إرسال الـ OTP */
  const handleResendOTP = async () => {
    if (!canResend) return;
    try {
      setResendLoading(true);
      setResendSuccess('');
      setOtpError('');
      await api.post('/auth/resend-otp', {
        email: formData.email,
      });
      setResendSuccess(t('otpResent'));
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);
      setCanResend(false);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setOtpError(err.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setResendLoading(false);
    }
  };

  /* دالة تسجيل الدخول بجوجل */
  const handleGoogle = () => {
    window.location.href = `${SOCKET_URL}/api/auth/google`;
  };

  /* دالة استقبال رد فيسبوك بعد تسجيل الدخول */
  const handleFacebookResponse = async (response) => {
    if (!response.accessToken) return;
    try {
      const res = await api.post('/auth/facebook/token', {
        accessToken: response.accessToken,
        userID: response.userID,
      });
      login(res.data.data.user, res.data.data.token);
      if (res.data.data.user.role === 'pending') {
        navigate('/role-selection');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('somethingWentWrong'));
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row justify-content-center align-items-center h-100">

        {/* قسم الصورة الجانبية */}
        <div className="signup-left col-md-5 rounded-3 m-0 p-0">
          <div className="Form_img w-100 h-100 position-relative rounded-3">
            <div className="signup-overlay-text text-center">
              <div className="blur rounded-3"></div>
              <div className="textimage">
                <h2>{t('buildYourPlan')}</h2>
                <p>
                  {t('buildYourPlanSubtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* قسم نموذج إنشاء الحساب */}
        <div className="col-md-5 signup-right">

          {/* خلفية الكور المتطيرة */}
          <MouseTrackingBackground />

          <div className="signup-form-wrapper">

            {/* شعار التطبيق */}
            <img
              src="/images/LogoBuggetWise.png"
              alt="BudgetWise Logo"
              className="signup-logo"
            />

            {/* عنوان الصفحة */}
            <h1>{t('signUp')}</h1>

            {/* نموذج إنشاء الحساب */}
            <form className="signup-form" onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>

              {/* حقل الاسم */}
              <div className="signup-form-group">
                <label htmlFor="signup-name">
                  {t('name')} <span className="required-star">*</span>
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className="signup-input"
                  placeholder={t('enterName')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* حقل البريد الإلكتروني */}
              <div className="signup-form-group">
                <label htmlFor="signup-email">
                  {t('email')} <span className="required-star">*</span>
                </label>
                <input
                  id="signup-email"
                  type="email"
                  className="signup-input"
                  placeholder={t('enterEmail')}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* حقل كلمة المرور */}
              <div className="signup-form-group">
                <label htmlFor="signup-password">
                  {t('password')} <span className="required-star">*</span>
                </label>
                <div className="password-wrapper">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    className="signup-input"
                    placeholder={t('enterPassword')}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* حقل تأكيد كلمة المرور */}
              <div className="signup-form-group">
                <label htmlFor="signup-confirm-password">
                  {t('confirmPassword')} <span className="required-star">*</span>
                </label>
                <div className="password-wrapper">
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="signup-input"
                    placeholder={t('confirmPasswordPlaceholder')}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* زر إنشاء الحساب */}
              <button
                type="submit"
                className="signup-btn-primary"
                disabled={loading}
              >
                {loading ? 'Please wait...' : t('signUp')}
              </button>

              {/* رسالة الخطأ */}
              {error && <p className="signup-error">{error}</p>}

            </form>

            {/* الفاصل — أو */}
            <div className="signup-divider">
              <span>or</span>
            </div>

            {/* أزرار التسجيل الاجتماعي */}
            <div className="signup-social-buttons">

              {/* زر جوجل */}
              <button
                type="button"
                className="signup-social-btn"
                onClick={handleGoogle}
              >
                <GoogleIcon />
                {t('continueGoogle')}
              </button>

              {/* زر فيسبوك */}
              <FacebookLogin
                appId="1653079929265897"
                callback={handleFacebookResponse}
                render={renderProps => (
                  <button
                    type="button"
                    className="signup-social-btn"
                    onClick={renderProps.onClick}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {t('continueFacebook')}
                  </button>
                )}
              />

            </div>

            {/* لينك تسجيل الدخول لمن لديه حساب */}
            <p className="signup-create">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="signup-create-link">
                {t('logIn')}
              </Link>
            </p>

          </div>
        </div>

      </div>

      {/* نافذة التحقق من البريد الإلكتروني */}
      {showOTP && (
        <div className="otp-overlay">
          <div className={`otp-popup ${closingOTP ? 'otp-popup-closing' : ''}`}>

            {/* زر الإغلاق */}
            {!verifySuccess && (
              <button className="otp-close-btn" onClick={handleCloseOTP}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}

            {verifySuccess ? (
              /* شاشة النجاح */
              <div className="otp-success-screen">
                <img
                  src="/images/LogoBuggetWise.png"
                  alt="BudgetWise"
                  className="otp-success-logo"
                  width="160"
                  height="auto"
                />
                <div className="otp-checkmark">
                  <svg viewBox="0 0 52 52" className="otp-checkmark-svg">
                    <circle className="otp-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="otp-checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
                <h2 className="otp-success-title">{t('verified')}</h2>
                <p className="otp-success-msg">{successMessage}</p>
              </div>
            ) : (
              /* شاشة إدخال الـ OTP */
              <>
                <div className="otp-icon">✉️</div>
                <h2>{t('verifyEmail')}</h2>
                <p className="otp-subtitle">
                  {t('verifySubtitle')}<br />
                  <strong>{formData.email}</strong>
                </p>
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={handleOtpPaste}
                      maxLength={1}
                    />
                  ))}
                </div>
                {otpError && <p className="otp-error">{otpError}</p>}
                <button
                  className="otp-btn"
                  onClick={handleVerifyOTP}
                  disabled={loading}
                >
                  {loading ? t('verifying') : t('verify')}
                </button>
                {resendSuccess && (
                  <p className="otp-resend-success">{resendSuccess}</p>
                )}
                <p className="otp-resend">
                  {t('didntReceive')}{' '}
                  {canResend ? (
                    <span className="otp-resend-link" onClick={handleResendOTP}>
                      {resendLoading ? t('sending') : t('resendOTP')}
                    </span>
                  ) : (
                    <span className="otp-resend-timer">
                      {t('resendIn')} {resendTimer}s
                    </span>
                  )}
                </p>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
