import {
  ArrowLeft,
  Bell,
  Check,
  LogOut,
  Moon,
  Save,
  Shield,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import "../styles/settings.css";

function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] =
    useState(true);
  const [interviewReminders, setInterviewReminders] =
    useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  async function handleSave() {
    setIsSaving(true);
    setMessage("");

    try {
      /*
       * These settings are currently stored locally.
       * We are not changing your Supabase database structure.
       */
      localStorage.setItem(
        "interviewai_settings",
        JSON.stringify({
          emailNotifications,
          interviewReminders,
          darkMode,
        })
      );

      setMessage("Settings saved successfully.");
    } catch (error) {
      console.error("Settings save error:", error);
      setMessage("Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    /*
     * We intentionally do not delete the Supabase user here.
     * Account deletion requires a secure backend/Edge Function.
     */
    window.alert(
      "Account deletion is not enabled yet. Your account and interview data are safe."
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-topbar">
        <button
          type="button"
          className="settings-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="settings-brand">
          <div className="settings-brand-icon">
            <Sparkles size={17} />
          </div>

          <span>InterviewAI</span>
        </div>

        <div />
      </header>

      <main className="settings-main">
        <div className="settings-heading">
          <span className="settings-eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h1>Settings</h1>

          <p>
            Manage your InterviewAI preferences and account
            settings.
          </p>
        </div>

        {/* ACCOUNT */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2>Account</h2>

            <p>
              Your basic InterviewAI account information.
            </p>
          </div>

          <div className="settings-row">
            <div className="settings-row-content">
              <strong>
                <UserRound
                  size={15}
                  style={{
                    marginRight: "7px",
                    verticalAlign: "middle",
                  }}
                />
                Email address
              </strong>

              <span>
                Your email address used for signing in.
              </span>
            </div>

            <span className="settings-value">
              {email || "Not available"}
            </span>
          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2>
              <Bell
                size={17}
                style={{
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              />
              Notifications
            </h2>

            <p>
              Choose which InterviewAI notifications you want
              to receive.
            </p>
          </div>

          <div className="settings-row">
            <div className="settings-row-content">
              <strong>Email notifications</strong>

              <span>
                Receive useful updates and account
                notifications.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                emailNotifications ? "active" : ""
              }`}
              onClick={() =>
                setEmailNotifications(
                  !emailNotifications
                )
              }
              aria-label="Toggle email notifications"
            >
              <span className="settings-toggle-thumb" />
            </button>
          </div>

          <div className="settings-row">
            <div className="settings-row-content">
              <strong>Interview reminders</strong>

              <span>
                Get reminders to continue your interview
                practice.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                interviewReminders ? "active" : ""
              }`}
              onClick={() =>
                setInterviewReminders(
                  !interviewReminders
                )
              }
              aria-label="Toggle interview reminders"
            >
              <span className="settings-toggle-thumb" />
            </button>
          </div>
        </section>

        {/* APPEARANCE */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2>
              <Moon
                size={17}
                style={{
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              />
              Appearance
            </h2>

            <p>
              Control the appearance of your InterviewAI
              experience.
            </p>
          </div>

          <div className="settings-row">
            <div className="settings-row-content">
              <strong>Dark mode</strong>

              <span>
                InterviewAI currently uses a dark interface.
              </span>
            </div>

            <button
              type="button"
              className={`settings-toggle ${
                darkMode ? "active" : ""
              }`}
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              <span className="settings-toggle-thumb" />
            </button>
          </div>
        </section>

        {/* SECURITY */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2>
              <Shield
                size={17}
                style={{
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              />
              Security
            </h2>

            <p>
              Manage your current session.
            </p>
          </div>

          <div className="settings-row">
            <div className="settings-row-content">
              <strong>Sign out</strong>

              <span>
                Sign out of InterviewAI on this device.
              </span>
            </div>

            <button
              type="button"
              className="settings-danger-button"
              onClick={handleSignOut}
            >
              <LogOut
                size={15}
                style={{
                  marginRight: "6px",
                  verticalAlign: "middle",
                }}
              />
              Sign out
            </button>
          </div>
        </section>

        {/* DANGER ZONE */}
        <section className="settings-section settings-danger">
          <div className="settings-section-header">
            <h2>Danger zone</h2>

            <p>
              Actions in this section can affect your account.
            </p>
          </div>

          <div className="settings-row">
            <div className="settings-row-content">
              <strong>Delete account</strong>

              <span>
                Permanently delete your InterviewAI account.
              </span>
            </div>

            <button
              type="button"
              className="settings-danger-button"
              onClick={handleDeleteAccount}
            >
              Delete account
            </button>
          </div>
        </section>

        {/* SAVE */}
        <div className="settings-save-area">
          <button
            type="button"
            className="settings-save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              "Saving..."
            ) : message ? (
              <>
                <Check size={17} />
                Saved
              </>
            ) : (
              <>
                <Save size={17} />
                Save settings
              </>
            )}
          </button>
        </div>

        {message && (
          <div className="settings-message">
            {message}
          </div>
        )}
      </main>
    </div>
  );
}

export default Settings;