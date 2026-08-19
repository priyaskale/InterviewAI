import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/history.css";

function History() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user?.id) {
        setInterviews([]);
        setError("Please sign in again to view your history.");
        return;
      }

      const { data, error: queryError } = await supabase
        .from("interviews")
        .select(`
          id,
          user_id,
          job_role,
          experience,
          interview_type,
          difficulty,
          question_count,
          completed_questions,
          overall_score,
          correctness_score,
          relevance_score,
          clarity_score,
          technical_depth_score,
          evaluations,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (queryError) {
        throw queryError;
      }

      setInterviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("History loading error:", error);

      setError(
        error?.message ||
          "Unable to load your interview history."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function formatDate(dateString) {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getStatus(interview) {
    const completed =
      Number(interview.completed_questions) || 0;

    const total =
      Number(interview.question_count) || 0;

    if (total > 0 && completed >= total) {
      return "Completed";
    }

    return "In progress";
  }

  function getScore(interview) {
    const completed =
      Number(interview.completed_questions) || 0;

    const score =
      Number(interview.overall_score);

    if (
      completed === 0 ||
      !Number.isFinite(score)
    ) {
      return "—";
    }

    return score.toFixed(1);
  }

  function openInterviewResult(interviewId) {
    if (!interviewId) {
      return;
    }

    navigate(`/interview/result/${interviewId}`);
  }

  return (
    <div className="history-page">
      <header className="history-topbar">
        <button
          type="button"
          className="history-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="history-brand">
          <div className="history-brand-icon">
            <Sparkles size={17} />
          </div>

          <span>InterviewAI</span>
        </div>

        <div />
      </header>

      <main className="history-main">
        <div className="history-heading">
          <div>
            <span className="history-eyebrow">
              INTERVIEW HISTORY
            </span>

            <h1>Your interviews</h1>

            <p>
              Review your previous interview practice
              sessions and performance.
            </p>
          </div>

          <button
            type="button"
            className="history-performance-button"
            onClick={() => navigate("/performance")}
          >
            <BarChart3 size={17} />
            View performance
          </button>
        </div>

        {isLoading ? (
          <div className="history-empty-card">
            <LoaderCircle
              size={26}
              className="question-loader"
            />

            <h3>Loading your history...</h3>

            <p>
              Fetching your interview sessions.
            </p>
          </div>
        ) : error ? (
          <div className="history-empty-card">
            <FileText size={28} />

            <h3>Unable to load history</h3>

            <p>{error}</p>

            <button
              type="button"
              className="history-retry-button"
              onClick={loadHistory}
            >
              Try again
            </button>
          </div>
        ) : interviews.length === 0 ? (
          <div className="history-empty-card">
            <BriefcaseBusiness size={30} />

            <h3>No interviews yet</h3>

            <p>
              Your interview sessions will appear here
              after you start practicing.
            </p>

            <button
              type="button"
              className="history-start-button"
              onClick={() =>
                navigate("/interview/setup")
              }
            >
              Start an interview
              <ChevronRight size={17} />
            </button>
          </div>
        ) : (
          <section className="history-list">
            {interviews.map((interview) => {
              const completed =
                Number(
                  interview.completed_questions
                ) || 0;

              const total =
                Number(
                  interview.question_count
                ) || 0;

              const status =
                getStatus(interview);

              const score =
                getScore(interview);

              return (
                <button
                  type="button"
                  className="history-card"
                  key={interview.id}
                  onClick={() =>
                    openInterviewResult(
                      interview.id
                    )
                  }
                >
                  <div className="history-card-icon">
                    <BriefcaseBusiness size={21} />
                  </div>

                  <div className="history-card-content">
                    <div className="history-card-title">
                      <h2>
                        {interview.job_role ||
                          "Interview"}
                      </h2>

                      <span
                        className={
                          status === "Completed"
                            ? "history-status completed"
                            : "history-status progress"
                        }
                      >
                        {status}
                      </span>
                    </div>

                    <div className="history-card-meta">
                      <span>
                        {interview.interview_type ||
                          "Interview"}
                      </span>

                      <span>•</span>

                      <span>
                        {interview.difficulty ||
                          "Medium"}
                      </span>

                      <span>•</span>

                      <span>
                        {completed}/{total} questions
                      </span>
                    </div>

                    <small>
                      {formatDate(
                        interview.created_at
                      )}
                    </small>
                  </div>

                  <div className="history-score">
                    <span>Score</span>

                    <strong>{score}</strong>

                    <small>/10</small>
                  </div>

                  <ChevronRight
                    size={18}
                    className="history-card-arrow"
                  />
                </button>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default History;