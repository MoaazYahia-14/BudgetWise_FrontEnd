/* صفحة تسجيل الدخول — تحتوي على نموذج الدخول بجانب صورة ترويجية */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SOCKET_URL } from '../../config';
import '../../styles/pages/Login.css';
import '../../styles/pages/Login.responsive.css';
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

/* المكون الرئيسي لصفحة تسجيل الدخول */
export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  /* حالة بيانات الفورم */
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  /* حالة إظهار كلمة المرور */
  const [showPassword, setShowPassword] = useState(false);

  /* حالة تذكرني */
  const [rememberMe, setRememberMe] = useState(false);

  /* حالة التحميل */
  const [loading, setLoading] = useState(false);

  /* حالة الأخطاء */
  const [error, setError] = useState('');

  /* حالة إغلاق الـ OTP popup */
  const [closingOTP, setClosingOTP] = useState(false);

  /* حالة ظهور الـ OTP popup */
  const [showOTP, setShowOTP] = useState(false);

  /* حالة الـ OTP المدخل */
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  /* حالة خطأ الـ OTP */
  const [otpError, setOtpError] = useState('');

  /* حالة النجاح */
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /* حالة العد التنازلي */
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  /* حالات الـ Forgot Password */
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [closingForgotPassword, setClosingForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotResendTimer, setForgotResendTimer] = useState(60);
  const [forgotCanResend, setForgotCanResend] = useState(false);
  const [forgotResendLoading, setForgotResendLoading] = useState(false);
  const [forgotResendSuccess, setForgotResendSuccess] = useState('');

  /* دالة تحديث بيانات الفورم */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  /* دالة تسجيل الدخول */
  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError(t('fillAllFields'));
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('token', res.data.data.token);
      } else {
        localStorage.removeItem('rememberMe');
        sessionStorage.setItem('token', res.data.data.token);
      }
      login(res.data.data.user, res.data.data.token);
      
      if (res.data.data.user.role === 'pending') {
        navigate('/role-selection');
      } else {
        navigate(`/${res.data.data.user.role}/home`);
      }
    } catch (err) {
      const message = err.response?.data?.message || '';
      /* لو الإيميل مش متأكد، افتح الـ OTP popup */
      if (
        err.response?.status === 403 ||
        message.toLowerCase().includes('verify') ||
        message.toLowerCase().includes('not verified')
      ) {
        await handleResendForLogin();
        setShowOTP(true);
      } else {
        setError(message || t('somethingWentWrong'));
      }
    } finally {
      setLoading(false);
    }
  };

  /* عداد تنازلي للـ Forgot Password OTP */
  useEffect(() => {
    let interval;
    if (showForgotPassword && forgotStep === 2) {
      setForgotResendTimer(60);
      setForgotCanResend(false);
      interval = setInterval(() => {
        setForgotResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setForgotCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showForgotPassword, forgotStep]);

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

  /* منع الرجوع للخلف أثناء التحقق */
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

  /* دالة فتح popup نسيان الباسورد */
  const handleOpenForgotPassword = (e) => {
    e.preventDefault();
    setForgotStep(1);
    setForgotEmail('');
    setForgotOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotError('');
    setForgotSuccess(false);
    setShowForgotPassword(true);
  };

  /* دالة إغلاق popup نسيان الباسورد */
  const handleCloseForgotPassword = () => {
    setClosingForgotPassword(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setClosingForgotPassword(false);
    }, 300);
  };

  /* الخطوة الأولى - إرسال OTP على الإيميل */
  const handleForgotSendOTP = async () => {
    if (!forgotEmail) {
      setForgotError(t('fillAllFields'));
      return;
    }
    try {
      setForgotLoading(true);
      setForgotError('');
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setForgotLoading(false);
    }
  };

  /* الخطوة الثانية - التحقق من الـ OTP */
  const handleForgotVerifyOTP = async () => {
    const otpCode = forgotOtp.join('');
    if (otpCode.length < 6) {
      setForgotError(t('pleaseEnterOTP'));
      return;
    }
    try {
      setForgotLoading(true);
      setForgotError('');
      await api.post('/auth/verify-password-otp', {
        email: forgotEmail,
        otpCode: otpCode,
      });
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || t('invalidOTP'));
    } finally {
      setForgotLoading(false);
    }
  };

  /* دالة إعادة تعيين الباسورد - بتبعت email + otpCode + newPassword */
  const handleForgotResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setForgotError(t('fillAllFields'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError(t('passwordsNotMatch'));
      return;
    }
    if (newPassword.length < 8) {
      setForgotError(t('passwordTooShort'));
      return;
    }
    try {
      setForgotLoading(true);
      setForgotError('');
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        otpCode: forgotOtp.join(''),
        newPassword: newPassword,
      });
      setForgotSuccess(true);
      
      /* تسجيل دخول تلقائي بعد 2.5 ثانية لعرض رسالة النجاح */
      setTimeout(async () => {
        try {
          const res = await api.post('/auth/login', {
            email: forgotEmail,
            password: newPassword,
          });
          login(res.data.data.user, res.data.data.token);
          handleCloseForgotPassword();
          if (res.data.data.user.role === 'pending') {
            navigate('/role-selection');
          } else {
            navigate(`/${res.data.data.user.role}/home`);
          }
        } catch (err) {
          handleCloseForgotPassword();
        }
      }, 2500);

    } catch (err) {
      setForgotError(err.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setForgotLoading(false);
    }
  };

  /* دالة التعامل مع إدخال OTP نسيان الباسورد */
  const handleForgotOtpChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...forgotOtp];
    newOtp[index] = value.slice(-1);
    setForgotOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`forgot-otp-${index + 1}`).focus();
    }
  };

  /* دالة الـ Backspace في OTP نسيان الباسورد */
  const handleForgotOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      document.getElementById(`forgot-otp-${index - 1}`).focus();
    }
  };

  /* دالة التعامل مع اللصق (Paste) في خانات نسيان الباسورد */
  const handleForgotOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    
    const newOtp = [...forgotOtp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setForgotOtp(newOtp);
    
    const nextFocusIndex = pastedData.length < 6 ? pastedData.length : 5;
    const nextInput = document.getElementById(`forgot-otp-${nextFocusIndex}`);
    if (nextInput) nextInput.focus();
  };

  /* دالة إعادة إرسال OTP نسيان الباسورد */
  const handleForgotResendOTP = async () => {
    if (!forgotCanResend) return;
    try {
      setForgotResendLoading(true);
      setForgotResendSuccess('');
      setForgotError('');
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotResendSuccess(t('otpResent'));
      setForgotOtp(['', '', '', '', '', '']);
      setForgotResendTimer(60);
      setForgotCanResend(false);
      const interval = setInterval(() => {
        setForgotResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setForgotCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setForgotError(err.response?.data?.message || t('somethingWentWrong'));
    } finally {
      setForgotResendLoading(false);
    }
  };

  /* دالة إرسال OTP تلقائياً عند اكتشاف إن الإيميل مش متأكد */
  const handleResendForLogin = async () => {
    try {
      await api.post('/auth/resend-otp', {
        email: formData.email,
      });
    } catch (err) {
      console.error('Resend OTP error:', err);
    }
  };

  /* دالة إعادة إرسال الـ OTP يدوياً */
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

  /* دالة التحقق من الـ OTP */
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
      const message = response.data?.message || t('emailVerified');
      setSuccessMessage(message);
      setVerifySuccess(true);
      /* بعد النجاح يسجل دخول تلقائياً */
      setTimeout(async () => {
        try {
          const res = await api.post('/auth/login', {
            email: formData.email,
            password: formData.password,
          });
          login(res.data.data.user, res.data.data.token);
          if (res.data.data.user.role === 'pending') {
            navigate('/role-selection');
          } else {
            navigate(`/${res.data.data.user.role}/home`);
          }
        } catch (err) {
          navigate('/login');
        }
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

  /* دالة التعامل مع إدخال الـ OTP */
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`login-otp-${index + 1}`).focus();
    }
  };

  /* دالة التعامل مع الـ Backspace */
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`login-otp-${index - 1}`).focus();
    }
  };

  /* دالة التعامل مع اللصق (Paste) في خانات تفعيل الإيميل */
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
    const nextInput = document.getElementById(`login-otp-${nextFocusIndex}`);
    if (nextInput) nextInput.focus();
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
        navigate(`/${res.data.data.user.role}/home`);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('somethingWentWrong'));
    }
  };

  return (
    
    <div className="container-fluid vh-100">
              {/* خلفية الكور المتطيرة */}
        <MouseTrackingBackground />
      <div className="row justify-content-center align-items-center h-100">

        {/* قسم الصورة الجانبية */}
        <div className="login-left col-md-5 rounded-3 m-0 p-0">
          <div className="login-form-img w-100 h-100 position-relative rounded-3">
            <div className="login-overlay-text text-center">
              <div className="blur-login rounded-3"></div>
              <div className="login-textimage">
                <h2>{t('welcomeBack')}</h2>
                <p>{t('continuePlanning')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* قسم نموذج تسجيل الدخول */}
        <div className="col-md-5 login-right">



          <div className="login-form-wrapper">

            {/* شعار التطبيق */}
            <img
              src="/images/LogoBuggetWise.png"
              alt="BudgetWise Logo"
              className="login-logo"
            />

            {/* عنوان الصفحة */}
            <h1>{t('loginTitle')}</h1>

            {/* العنوان الفرعي */}
            <p className="login-subtitle">{t('loginSubtitle')}</p>

            {/* نموذج تسجيل الدخول */}
            <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>

              {/* حقل البريد الإلكتروني */}
              <div className="login-form-group">
                <label htmlFor="login-email">
                  {t('email')} <span className="required-star">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder={t('enterEmail')}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* حقل كلمة المرور */}
              <div className="login-form-group">
                <label htmlFor="login-password">
                  {t('password')} <span className="required-star">*</span>
                </label>
                <div className="password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
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

              {/* نسيت كلمة المرور + تذكرني */}
              <div className="login-options">
                <span
                  className="login-forgot"
                  onClick={handleOpenForgotPassword}
                >
                  {t('forgotPassword')}
                </span>
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {t('rememberMe')}
                </label>
              </div>

              {/* زر تسجيل الدخول */}
              <button
                type="submit"
                className="login-btn-primary"
                disabled={loading}
              >
                {loading ? t('loggingIn') : t('logIn')}
              </button>

              {/* رسالة الخطأ */}
              {error && <p className="login-error">{error}</p>}

            </form>

            {/* الفاصل — أو */}
            <div className="login-divider">
              <span>or</span>
            </div>

            {/* أزرار تسجيل الدخول الاجتماعي */}
            <div className="login-social-buttons">

              {/* زر جوجل */}
              <button
                type="button"
                className="login-social-btn"
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
                    className="login-social-btn"
                    onClick={renderProps.onClick}
                  >
                    <FacebookIcon />
                    {t('continueFacebook')}
                  </button>
                )}
              />

            </div>

            {/* لينك إنشاء حساب */}
            <p className="login-create">
              {t('dontHaveAccount')}{' '}
              <Link to="/signup" className="login-create-link">
                {t('createOne')}
              </Link>
            </p>

          </div>
        </div>

      </div>

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
                      id={`login-otp-${index}`}
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

      {showForgotPassword && (
        <div className="otp-overlay">
          <div className={`otp-popup forgot-popup ${closingForgotPassword ? 'otp-popup-closing' : ''}`}>

            {/* زر الإغلاق */}
            {!forgotSuccess && (
              <button className="otp-close-btn" onClick={handleCloseForgotPassword}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}

            {forgotSuccess ? (
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
                <h2 className="otp-success-title">{t('passwordResetSuccess')}</h2>
                <p className="otp-success-msg">{t('passwordResetSuccessMsg')}</p>
              </div>

            ) : forgotStep === 1 ? (
              /* الخطوة الأولى - إدخال الإيميل */
              <>
                <div className="otp-icon">🔐</div>
                <h2>{t('forgotPasswordTitle')}</h2>
                <p className="otp-subtitle">{t('forgotPasswordSubtitle')}</p>
                <div className="forgot-input-group">
                  <label>{t('email')} <span className="required-star">*</span></label>
                  <input
                    type="email"
                    className="login-input forgot-input"
                    placeholder={t('enterEmail')}
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setForgotError('');
                    }}
                  />
                </div>
                {forgotError && <p className="otp-error">{forgotError}</p>}
                <button
                  className="otp-btn"
                  onClick={handleForgotSendOTP}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? t('sending') : t('sendCode')}
                </button>
              </>

            ) : forgotStep === 2 ? (
              /* الخطوة الثانية - إدخال الـ OTP */
              <>
                <div className="otp-icon">✉️</div>
                <h2>{t('verifyEmail')}</h2>
                <p className="otp-subtitle">
                  {t('verifySubtitle')}<br />
                  <strong>{forgotEmail}</strong>
                </p>
                <div className="otp-inputs">
                  {forgotOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`forgot-otp-${index}`}
                      type="text"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleForgotOtpChange(e, index)}
                      onKeyDown={(e) => handleForgotOtpKeyDown(e, index)}
                      onPaste={handleForgotOtpPaste}
                      maxLength={1}
                    />
                  ))}
                </div>
                {forgotError && <p className="otp-error">{forgotError}</p>}
                <button
                  className="otp-btn"
                  onClick={handleForgotVerifyOTP}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? t('verifying') : t('verify')}
                </button>
                {forgotResendSuccess && (
                  <p className="otp-resend-success">{forgotResendSuccess}</p>
                )}
                <p className="otp-resend">
                  {t('didntReceive')}{' '}
                  {forgotCanResend ? (
                    <span className="otp-resend-link" onClick={handleForgotResendOTP}>
                      {forgotResendLoading ? t('sending') : t('resendOTP')}
                    </span>
                  ) : (
                    <span className="otp-resend-timer">
                      {t('resendIn')} {forgotResendTimer}s
                    </span>
                  )}
                </p>
              </>

            ) : (
              /* الخطوة الثالثة - إدخال الباسورد الجديد */
              <>
                <div className="otp-icon">🔒</div>
                <h2>{t('resetPassword')}</h2>
                <p className="otp-subtitle">{t('resetPasswordSubtitle')}</p>
                <div className="forgot-input-group">
                  <label>{t('newPassword')} <span className="required-star">*</span></label>
                  <div className="password-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="login-input forgot-input"
                      placeholder={t('enterPassword')}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setForgotError('');
                      }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
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
                <div className="forgot-input-group">
                  <label>{t('confirmPassword')} <span className="required-star">*</span></label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      className="login-input forgot-input"
                      placeholder={t('confirmPasswordPlaceholder')}
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        setForgotError('');
                      }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    >
                      {showConfirmNewPassword ? (
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
                {forgotError && <p className="otp-error">{forgotError}</p>}
                <button
                  className="otp-btn"
                  onClick={handleForgotResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? t('saving') : t('resetPassword')}
                </button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}