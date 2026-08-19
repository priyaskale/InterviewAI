import { Sparkles } from "lucide-react";
import "../styles/auth.css";

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Sparkles size={19} />
          </div>
          <span>InterviewAI</span>
        </div>

        {children}

        <p className="auth-footer">
          © 2026 InterviewAI. Practice smarter.
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;