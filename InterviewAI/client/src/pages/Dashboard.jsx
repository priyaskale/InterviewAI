import {
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import "../styles/app.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [interviews, setInterviews] = useState([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
  const [interviewError, setInterviewError] = useState("");

  const [currentUser, setCurrentUser] = useState(user || null);

  const displayName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.user_metadata?.name ||
    currentUser?.email?.split("@")[0] ||
    "Candidate";

  const getCurrentUser = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Failed to get authenticated user:", error);
        return null;
      }

      if (authUser) {
        setCurrentUser(authUser);
      }

      return authUser;
    } catch (error) {
      console.error("Unexpected auth error:", error);
      return null;
    }
  }, []);

  const loadInterviews = useCallback(async () => {
    setIsLoadingInterviews(true);
    setInterviewError("");

    try {
      const authUser = await getCurrentUser();

      if (!authUser?.id) {
        console.warn(
          "Dashboard: No authenticated Supabase user found."
        );

        setInterviews([]);
        setInterviewError(
          "Please sign in again to view your interview history."
        );

        return;
      }

      console.log(
        "Dashboard authenticated user:",
        authUser.id
      );

      const { data, error } = await supabase
        .from("interviews")
        .select(
          `
            id,
            user_id,
            job_role,
            experience,
            interview_type,
            difficulty,
            question_count,
            completed_questions,
            overall_score,
            created_at
          `
        )
        .eq("user_id", authUser.id)
        .order("created_at", {
          ascending: false,
        });

      console.log(
        "Dashboard interview query user ID:",
        authUser.id
      );

      console.log(
        "Dashboard interviews returned:",
        data
      );

      if (error) {
        console.error(
          "Dashboard Supabase interview error:",
          error
        );

        throw error;
      }

      setInterviews(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load interviews:",
        error
      );

      setInterviews([]);

      setInterviewError(
        error?.message
          ? `Unable to load your interview history: ${error.message}`
          : "Unable to load your interview history."
      );
    } finally {
      setIsLoadingInterviews(false);
    }
  }, [getCurrentUser]);

  useEffect(() => {
    let isMounted = true;

    async function initializeDashboard() {
      const authUser = await getCurrentUser();

      if (!isMounted) {
        return;
      }

      if (authUser?.id) {
        await loadInterviews();
      } else {
        setIsLoadingInterviews(false);
        setInterviews([]);
        setInterviewError(
          "Please sign in again to view your interview history."
        );
      }
    }

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [getCurrentUser, loadInterviews]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible" &&
        currentUser?.id
      ) {
        loadInterviews();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [currentUser?.id, loadInterviews]);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const completedInterviewList =
    interviews.filter((interview) => {
      const completedQuestions =
        Number(
          interview.completed_questions
        ) || 0;

      const questionCount =
        Number(
          interview.question_count
        ) || 0;

      return (
        questionCount > 0 &&
        completedQuestions >= questionCount
      );
    });

  const completedInterviews =
    completedInterviewList.length;

  const totalScore =
    completedInterviewList.reduce(
      (total, interview) =>
        total +
        (Number(
          interview.overall_score
        ) || 0),
      0
    );

  const averageScore =
    completedInterviews
      ? (
          totalScore /
          completedInterviews
        ).toFixed(1)
      : "—";

  const recentInterviews =
    interviews.slice(0, 5);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>

          <span>InterviewAI</span>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">
            MAIN
          </p>

          {/* DASHBOARD */}
          <button
            type="button"
            className="nav-item active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          {/* INTERVIEWS */}
          <button
            type="button"
            className="nav-item"
            onClick={() =>
              navigate("/interview/setup")
            }
          >
            <BriefcaseBusiness size={19} />
            <span>Interviews</span>
          </button>

          {/* PERFORMANCE */}
          <button
            type="button"
            className="nav-item"
            onClick={() =>
              navigate("/performance")
            }
          >
            <BarChart3 size={19} />
            <span>Performance</span>
          </button>

          {/* HISTORY */}
          <button
            type="button"
            className="nav-item"
            onClick={() =>
              navigate("/history")
            }
          >
            <FileText size={19} />
            <span>History</span>
          </button>

          <p className="nav-label settings-label">
            ACCOUNT
          </p>

          {/* PROFILE */}
          <button
            type="button"
            className="nav-item"
            onClick={() =>
              navigate("/profile")
            }
          >
            <UserRound size={19} />
            <span>Profile</span>
          </button>

          {/* SETTINGS */}
          <button
            type="button"
            className="nav-item"
            onClick={() =>
              navigate("/settings")
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout-button"
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              WELCOME BACK
            </p>

            <h1>
              Good evening, {displayName}
            </h1>
          </div>

          <div className="profile">
            <div className="avatar">
              {displayName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-info">
              <strong>
                {displayName}
              </strong>

              <span>Candidate</span>
            </div>
          </div>
        </header>

        <section className="hero-card">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={15} />
              AI-Powered Interview Practice
            </div>

            <h2>
              Practice interviews.
              <br />
              Build confidence.
            </h2>

            <p>
              Prepare for your next opportunity
              with realistic AI interviews,
              instant feedback, and
              personalized insights.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                navigate(
                  "/interview/setup"
                )
              }
            >
              Start an interview
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="hero-visual">
            <div className="visual-orb">
              <Sparkles size={42} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <div>
              <h3>Your progress</h3>

              <p>
                Keep improving with every
                interview.
              </p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                navigate(
                  "/performance"
                )
              }
            >
              View performance
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">
                Interviews completed
              </span>

              <strong>
                {isLoadingInterviews
                  ? "..."
                  : completedInterviews}
              </strong>

              <span className="stat-change">
                {isLoadingInterviews
                  ? "Loading your interviews"
                  : completedInterviews === 0
                    ? "Start your first interview"
                    : "Keep practicing"}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Average score
              </span>

              <strong>
                {isLoadingInterviews
                  ? "..."
                  : averageScore}

                {!isLoadingInterviews &&
                  averageScore !== "—" &&
                  "/10"}
              </strong>

              <span className="stat-change">
                {isLoadingInterviews
                  ? "Calculating score"
                  : completedInterviews === 0
                    ? "No completed interviews yet"
                    : "Across completed interviews"}
              </span>
            </div>

            <div className="stat-card">
              <span className="stat-label">
                Practice time
              </span>

              <strong>—</strong>

              <span className="stat-change">
                Time tracking coming soon
              </span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <div>
              <h3>Recent interviews</h3>

              <p>
                Review your latest practice
                sessions.
              </p>
            </div>

            {!isLoadingInterviews &&
              interviews.length > 5 && (
                <button
                  className="text-button"
                  onClick={
                    loadInterviews
                  }
                >
                  Refresh
                  <ChevronRight size={16} />
                </button>
              )}
          </div>

          {isLoadingInterviews ? (
            <div className="interview-card">
              <div className="interview-icon">
                <LoaderCircle
                  size={20}
                  className="question-loader"
                />
              </div>

              <div className="interview-details">
                <strong>
                  Loading interviews...
                </strong>

                <span>
                  Fetching your latest
                  practice sessions.
                </span>
              </div>
            </div>
          ) : interviewError ? (
            <div className="interview-card">
              <div className="interview-icon">
                <FileText size={20} />
              </div>

              <div className="interview-details">
                <strong>
                  Unable to load interviews
                </strong>

                <span>
                  {interviewError}
                </span>

                <button
                  className="text-button"
                  onClick={
                    loadInterviews
                  }
                  style={{
                    marginTop: "8px",
                  }}
                >
                  Try again
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : recentInterviews.length ===
            0 ? (
            <div className="interview-card">
              <div className="interview-icon">
                <BriefcaseBusiness
                  size={20}
                />
              </div>

              <div className="interview-details">
                <strong>
                  No interviews yet
                </strong>

                <span>
                  Your completed interviews
                  will appear here.
                </span>
              </div>
            </div>
          ) : (
            <div className="recent-interviews-list">
              {recentInterviews.map(
                (interview) => {
                  const score =
                    Number(
                      interview.overall_score
                    );

                  const completedQuestions =
                    Number(
                      interview.completed_questions
                    ) || 0;

                  const questionCount =
                    Number(
                      interview.question_count
                    ) || 0;

                  const isCompleted =
                    questionCount > 0 &&
                    completedQuestions >=
                      questionCount;

                  const hasScore =
                    Number.isFinite(score) &&
                    isCompleted;

                  return (
                    <div
                      className="interview-card"
                      key={
                        interview.id
                      }
                    >
                      <div className="interview-icon">
                        <BriefcaseBusiness
                          size={20}
                        />
                      </div>

                      <div className="interview-details">
                        <strong>
                          {interview.job_role ||
                            "Interview"}
                        </strong>

                        <span>
                          {interview.interview_type ||
                            "Interview"}{" "}
                          •{" "}
                          {interview.difficulty ||
                            "Medium"}{" "}
                          •{" "}
                          {
                            completedQuestions
                          }
                          /
                          {
                            questionCount
                          }{" "}
                          questions
                        </span>

                        <small>
                          {isCompleted
                            ? formatDate(
                                interview.created_at
                              )
                            : `In progress • ${formatDate(
                                interview.created_at
                              )}`}
                        </small>
                      </div>

                      <div className="interview-result">
                        <strong>
                          {hasScore
                            ? score.toFixed(
                                1
                              )
                            : "—"}
                        </strong>

                        <span>/10</span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;