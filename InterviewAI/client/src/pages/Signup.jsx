import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import { supabase } from "../services/supabase";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    if (data.session) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setSuccess(
      "Account created. Check your email to confirm your account."
    );
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-heading">
          <h1>Create your account</h1>
          <p>Start practicing interviews with your AI coach.</p>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="form-field">
            <label htmlFor="name">Full name</label>

            <div className="input-wrapper">
              <UserRound size={18} />

              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">Email address</label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Signup;