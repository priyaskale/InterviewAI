import {
  ArrowLeft,
  Mail,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError("");

      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!authUser) {
          navigate("/login", { replace: true });
          return;
        }

        setUser(authUser);

        setEmail(authUser.email || "");

        setFullName(
          authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            ""
        );
      } catch (error) {
        console.error("Profile loading error:", error);

        setError(
          error?.message ||
            "Unable to load your profile."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  async function handleSave(event) {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("Please enter your name.");
      setMessage("");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const { data, error: updateError } =
        await supabase.auth.updateUser({
          data: {
            full_name: fullName.trim(),
          },
        });

      if (updateError) {
        throw updateError;
      }

      setUser(data.user);

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      setError(
        error?.message ||
          "Unable to update your profile."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const avatarLetter =
    fullName.trim().charAt(0).toUpperCase() ||
    email.charAt(0).toUpperCase() ||
    "C";

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="profile-brand">
          <div className="profile-brand-icon">
            <Sparkles size={17} />
          </div>

          <span>InterviewAI</span>
        </div>

        <div />
      </header>

      <main className="profile-main">
        <div className="profile-heading">
          <span className="profile-eyebrow">
            ACCOUNT
          </span>

          <h1>Your profile</h1>

          <p>
            Manage your InterviewAI profile
            information.
          </p>
        </div>

        {error && (
          <div className="profile-message error">
            {error}
          </div>
        )}

        {message && (
          <div className="profile-message success">
            {message}
          </div>
        )}

        <section className="profile-card">
          <div className="profile-card-header">
            <div className="profile-large-avatar">
              {avatarLetter}
            </div>

            <div>
              <h2>
                {fullName || "Candidate"}
              </h2>

              <p>
                InterviewAI Candidate
              </p>
            </div>
          </div>

          <form
            className="profile-form"
            onSubmit={handleSave}
          >
            <div className="profile-field">
              <label htmlFor="fullName">
                Full name
              </label>

              <div className="profile-input-wrapper">
                <UserRound size={18} />

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="email">
                Email address
              </label>

              <div className="profile-input-wrapper disabled">
                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />
              </div>

              <small>
                Your email address is managed
                by your account.
              </small>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={isSaving}
              >
                <Save size={17} />

                {isSaving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Profile;