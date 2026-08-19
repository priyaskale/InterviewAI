import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/performance.css";

function Performance() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPerformance = useCallback(async () => {
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
        setError("Please sign in again to view your performance.");
        setInterviews([]);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("interviews")
        .select(`
          id,
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
      console.error("Performance loading error:", error);

      setError(
        error?.message ||
          "Unable to load your performance data."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPerformance();
  }, [loadPerformance]);

  const completedInterviews = interviews.filter((interview) => {
    const completed =
      Number(interview.completed_questions) || 0;

    const total =
      Number(interview.question_count) || 0;

    return total > 0 && completed >= total;
  });

  const completedCount = completedInterviews.length;

  const calculateAverage = (field) => {
    if (!completedCount) {
      return 0;
    }

    const total = completedInterviews.reduce(
      (sum, interview) =>
        sum + (Number(interview[field]) || 0),
      0
    );

    return Number(
      (total / completedCount).toFixed(1)
    );
  };

  const overallScore =
    calculateAverage("overall_score");

  const correctness =
    calculateAverage("correctness_score");

  const relevance =
    calculateAverage("relevance_score");

  const clarity =
    calculateAverage("clarity_score");

  const technicalDepth =
    calculateAverage("technical_depth_score");

  const getScoreMessage = () => {
    if (!completedCount) {
      return "Complete an interview to see your performance.";
    }

    if (overallScore >= 8) {
      return "Excellent work! You're showing strong interview skills.";
    }

    if (overallScore >= 6) {
      return "Good progress! Keep practicing to improve your score.";
    }

    return "Keep practicing. Every interview is an opportunity to improve.";
  };

  const formatDate = (dateString) => {
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
  };

  return (
    <div className="performance-page">
      <header className="performance-topbar">
        <button
          type="button"
          className="performance-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="performance-brand">
          <div className="performance-brand-icon">
            <Sparkles size={17} />
          </div>

          <span>InterviewAI</span>
        </div>

        <div />
      </header>

      <main className="performance-main">
        <div className="performance-heading">
          <div>
            <span className="performance-eyebrow">
              PERFORMANCE
            </span>

            <h1>Your performance</h1>

            <p>
              Track your interview progress and understand
              where you can improve.
            </p>
          </div>

          <button
            type="button"
            className="performance-history-button"
            onClick={() => navigate("/history")}
          >
            <FileText size={17} />
            Interview history
          </button>
        </div>

        {isLoading ? (
          <div className="performance-empty-card">
            <LoaderCircle
              size={28}
              className="performance-loader"
            />

            <h3>Loading performance...</h3>

            <p>
              Calculating your interview performance.
            </p>
          </div>
        ) : error ? (
          <div className="performance-empty-card">
            <BarChart3 size={30} />

            <h3>Unable to load performance</h3>

            <p>{error}</p>

            <button
              type="button"
              className="performance-retry-button"
              onClick={loadPerformance}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <section className="performance-overview">
              <div className="performance-score-card">
                <div className="performance-score-icon">
                  <TrendingUp size={22} />
                </div>

                <span>Overall score</span>

                <strong>
                  {completedCount
                    ? overallScore
                    : "—"}
                </strong>

                <small>/10</small>

                <p>{getScoreMessage()}</p>
              </div>

              <div className="performance-stat-card">
                <div className="performance-stat-icon">
                  <CheckCircle2 size={21} />
                </div>

                <span>Interviews completed</span>

                <strong>
                  {completedCount}
                </strong>

                <p>
                  {completedCount === 0
                    ? "No completed interviews yet"
                    : "Completed practice sessions"}
                </p>
              </div>

              <div className="performance-stat-card">
                <div className="performance-stat-icon">
                  <Target size={21} />
                </div>

                <span>Total interviews</span>

                <strong>
                  {interviews.length}
                </strong>

                <p>
                  Including interviews in progress
                </p>
              </div>
            </section>

            <section className="performance-section">
              <div className="performance-section-heading">
                <div>
                  <h2>Skill breakdown</h2>

                  <p>
                    Your average scores across completed
                    interviews.
                  </p>
                </div>
              </div>

              {completedCount === 0 ? (
                <div className="performance-no-data">
                  <BarChart3 size={28} />

                  <h3>No performance data yet</h3>

                  <p>
                    Complete an interview to see your
                    skill breakdown.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/interview/setup")
                    }
                  >
                    Start an interview
                  </button>
                </div>
              ) : (
                <div className="skill-grid">
                  <div className="skill-card">
                    <div className="skill-card-top">
                      <span>Correctness</span>

                      <strong>
                        {correctness}/10
                      </strong>
                    </div>

                    <div className="skill-track">
                      <div
                        className="skill-fill"
                        style={{
                          width: `${correctness * 10}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-card-top">
                      <span>Relevance</span>

                      <strong>
                        {relevance}/10
                      </strong>
                    </div>

                    <div className="skill-track">
                      <div
                        className="skill-fill"
                        style={{
                          width: `${relevance * 10}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-card-top">
                      <span>Clarity</span>

                      <strong>
                        {clarity}/10
                      </strong>
                    </div>

                    <div className="skill-track">
                      <div
                        className="skill-fill"
                        style={{
                          width: `${clarity * 10}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="skill-card">
                    <div className="skill-card-top">
                      <span>Technical depth</span>

                      <strong>
                        {technicalDepth}/10
                      </strong>
                    </div>

                    <div className="skill-track">
                      <div
                        className="skill-fill"
                        style={{
                          width: `${technicalDepth * 10}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="performance-section">
              <div className="performance-section-heading">
                <div>
                  <h2>Completed interviews</h2>

                  <p>
                    Your completed practice sessions.
                  </p>
                </div>
              </div>

              {completedCount === 0 ? (
                <div className="performance-no-data">
                  <p>
                    No completed interviews to display.
                  </p>
                </div>
              ) : (
                <div className="performance-interview-list">
                  {completedInterviews.map((interview) => (
                    <div
                      className="performance-interview-card"
                      key={interview.id}
                    >
                      <div className="performance-interview-icon">
                        <BarChart3 size={20} />
                      </div>

                      <div className="performance-interview-details">
                        <strong>
                          {interview.job_role ||
                            "Interview"}
                        </strong>

                        <span>
                          {interview.interview_type ||
                            "Interview"}{" "}
                          •{" "}
                          {interview.difficulty ||
                            "Medium"}
                        </span>

                        <small>
                          {formatDate(
                            interview.created_at
                          )}
                        </small>
                      </div>

                      <div className="performance-interview-score">
                        <strong>
                          {Number(
                            interview.overall_score
                          ).toFixed(1)}
                        </strong>

                        <span>/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Performance;