import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CircleCheck, Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AuthLayout from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks";
import { useTranslation } from "@/i18n";
import {
  resetPasswordWithOtp,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
} from "@/services";
import { isApiEnabled } from "@/constants";
import RequiredFieldsHint from "@/components/common/RequiredFieldsHint";
import { isSamePassword, isValidPassword } from "@/utils/passwordRules";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const STEPS = ["email", "otp", "password"];

const OtpBoxes = ({ value, onChange, disabled }) => {
  const inputsRef = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const focusIndex = (index) => {
    inputsRef.current[index]?.focus();
  };

  const updateAt = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").replace(/\s/g, ""));
  };

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    updateAt(index, digit);
    if (digit && index < OTP_LENGTH - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusIndex(index - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={clsx(
            "w-10 h-12 sm:w-11 sm:h-12 rounded-xl border text-center text-lg font-semibold text-slate-800",
            "bg-white/80 border-slate-200 shadow-sm outline-none transition-all",
            "focus:border-primary-400 focus:ring-2 focus:ring-primary-200/80",
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const previousPassword = location.state?.previousPassword ?? "";

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const stepIndex = STEPS.indexOf(step);
  const loginPath = "/login";
  const passwordValid = isValidPassword(password);

  const finishLogin = (user) => {
    if (user.role === "mentor") navigate("/mentor/home", { replace: true });
    else if (user.role === "admin") navigate("/admin", { replace: true });
    else navigate("/home", { replace: true });
  };

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const goBack = () => {
    setError("");
    if (step === "email") navigate(loginPath);
    else if (step === "otp") setStep("email");
    else setStep("otp");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetOtp(email.trim());
      setStep("otp");
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(err.message || t("auth.otpSendFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendIn > 0 || resendLoading || loading) return;
    setError("");
    setResendLoading(true);
    try {
      await sendPasswordResetOtp(email.trim());
      setOtp("");
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(err.message || t("auth.otpSendFailed"));
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length !== OTP_LENGTH) {
      setError(t("auth.invalidOtp"));
      return;
    }
    setLoading(true);
    try {
      const result = await verifyPasswordResetOtp(email.trim(), otp.trim());
      setResetToken(result.resetToken || "verified");
      setStep("password");
    } catch (err) {
      setError(err.message || t("auth.invalidOtp"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (!passwordValid) {
      setError(t("auth.passwordRequirements"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    if (previousPassword && isSamePassword(previousPassword, password)) {
      setError(t("auth.newPasswordSameAsOld"));
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithOtp({
        email: email.trim(),
        otp: otp.trim(),
        password,
      });
      if (isApiEnabled()) {
        navigate(loginPath, { replace: true, state: { email: email.trim() } });
        return;
      }
      const user = await login({ email: email.trim(), password });
      finishLogin(user);
    } catch (err) {
      setError(err.message || t("auth.passwordResetFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.forgotPasswordHeroTitle")}
      subtitle={t("auth.forgotPasswordHeroSubtitle")}
      footer={
        <p className="text-center text-sm text-on-glass-muted mt-6">
          <Link
            to={loginPath}
            className="text-primary-600 font-semibold hover:underline"
          >
            {t("auth.backToLogin")}
          </Link>
        </p>
      }
    >
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {step === "email" ? t("auth.backToLogin") : t("auth.back")}
      </button>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${stepIndex * 100}%)` }}
        >
          {/* Step 1 — Email */}
          <div className="w-full flex-shrink-0 pr-0">
            <div className="text-center mb-6 lg:text-left">
              <h1 className="text-2xl font-bold text-on-glass">
                {t("auth.forgotPasswordTitle")}
              </h1>
              <p className="text-on-glass-muted text-base mt-1.5 leading-normal">
                {t("auth.forgotPasswordSubtitle")}
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <RequiredFieldsHint>{t("auth.requiredFieldsHint")}</RequiredFieldsHint>
              <Input
                variant="glass"
                label={t("auth.emailAddress")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <p className="text-sm text-slate-500 leading-relaxed">
                {t("auth.forgotPasswordEmailHint")}
              </p>
              {!isApiEnabled() && (
                <p className="text-xs text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
                  {t("auth.otpDemoHint")}
                </p>
              )}
              {step === "email" && error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="md"
                disabled={loading}
              >
                {loading ? t("auth.sendingOtp") : t("auth.sendOtp")}
              </Button>
            </form>
          </div>

          {/* Step 2 — OTP */}
          <div className="w-full flex-shrink-0 pr-0">
            <div className="text-center mb-6 lg:text-left">
              <h1 className="text-2xl font-bold text-on-glass">
                {t("auth.otpTitle")}
              </h1>
              <p className="text-on-glass-muted text-base mt-1.5 leading-normal">
                {t("auth.otpSubtitle", { email })}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <RequiredFieldsHint>{t("auth.requiredFieldsHint")}</RequiredFieldsHint>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700 text-center lg:text-left">
                  {t("auth.verificationCode")}
                  <span className="text-red-500 ml-0.5 font-bold">*</span>
                </p>
                <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />
              </div>

              <div className="flex flex-col items-stretch gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendOtp}
                  disabled={resendIn > 0 || resendLoading || loading}
                  loading={resendLoading}
                >
                  {resendIn > 0
                    ? t("auth.resendIn", { seconds: resendIn })
                    : t("auth.resendOtp")}
                </Button>
              </div>

              {step === "otp" && error && (
                <p className="text-sm text-red-500 text-center lg:text-left">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="md"
                disabled={loading || otp.length !== OTP_LENGTH}
              >
                {loading ? t("auth.verifyingOtp") : t("auth.verifyOtp")}
              </Button>
            </form>
          </div>

          {/* Step 3 — New password */}
          <div className="w-full flex-shrink-0 pr-0">
            <div className="text-center mb-6 lg:text-left">
              <h1 className="text-2xl font-bold text-on-glass">
                {t("auth.newPasswordTitle")}
              </h1>
              <p className="text-on-glass-muted text-base mt-1.5 leading-normal">
                {t("auth.newPasswordSubtitle")}
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <RequiredFieldsHint>{t("auth.requiredFieldsHint")}</RequiredFieldsHint>
              <Input
                variant="glass"
                label={t("auth.password")}
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordMinPlaceholder")}
                required
                className={passwordValid ? "pr-[4.25rem]" : undefined}
                rightIcon={
                  <div className="flex items-center gap-1.5">
                    {passwordValid && (
                      <CircleCheck
                        className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                        strokeWidth={2}
                        role="status"
                        aria-label={t("auth.passwordValid")}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-slate-400 hover:text-slate-600"
                      aria-label={
                        showPass ? t("auth.hidePassword") : t("auth.showPassword")
                      }
                    >
                      {showPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                }
              />
              <Input
                variant="glass"
                label={t("auth.confirmPassword")}
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("auth.passwordMinPlaceholder")}
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
              {step === "password" && error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="md"
                disabled={loading}
              >
                {loading
                  ? t("auth.resettingPassword")
                  : t("auth.resetPasswordButton")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
