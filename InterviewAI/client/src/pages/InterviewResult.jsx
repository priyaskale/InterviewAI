import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileText,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import "../styles/interview-result.css";

function InterviewResult() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInterview() {
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
          setError("Please sign in again.");
          return;
        }

        if (!id) {
          setError("Interview could not be found.");
          return;
        }

        const { data, error: queryError } =
          await supabase
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
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (queryError) {
          throw queryError;
        }

        setInterview(data);
      } catch (error) {
        console.error(
          "Interview result loading error:",
          error
        );

        setError(
          error?.message ||
            "Unable to load this interview result."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadInterview();
  }, [id]);

  function score(value) {
    const number = Number(value);

    return Number.isFinite(number)
      ? number.toFixed(1)
      : "—";
  }

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

  function getEvaluations() {
    if (!interview?.evaluations) {
      return [];
    }

    if (Array.isArray(interview.evaluations)) {
      return interview.evaluations;
    }

    if (
      typeof interview.evaluations === "string"
    ) {
      try {
        const parsed = JSON.parse(
          interview.evaluations
        );

        return Array.isArray(parsed)
          ? parsed
          : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  if (isLoading) {
    return (
      <div className="result-loading">
        <div className="result-loading-spinner" />
        <p>Loading your interview result...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="result-page">
        <div className="result-error-card">
          <FileText size={32} />

          <h2>
            Unable to load interview result
          </h2>

          <p>
            {error ||
              "This interview could not be found."}
          </p>

          <button
            className="result-primary-button"
            onClick={() => navigate("/history")}
          >
            <ArrowLeft size={17} />
            Back to history
          </button>
        </div>
      </div>
    );
  }

  const evaluations = getEvaluations();

  const overallScore =
    Number(interview.overall_score);

  const hasOverallScore =
    Number.isFinite(overallScore);

  return (
    <div className="result-page">
      <header className="result-topbar">
        <button
          type="button"
          className="result-back-button"
          onClick={() => navigate("/history")}
        >
          <ArrowLeft size={18} />
          History
        </button>

        <div className="result-brand">
          <div className="result-brand-icon">
            <Sparkles size={17} />
          </div>

          <span>InterviewAI</span>
        </div>

        <div />
      </header>

      <main className="result-main">
        <div className="result-heading">
          <span className="result-eyebrow">
            INTERVIEW RESULT
          </span>

          <h1>
            {interview.job_role ||
              "Interview"}
          </h1>

          <p>
            {interview.interview_type ||
              "Technical"}{" "}
            •{" "}
            {interview.difficulty ||
              "Medium"}{" "}
            •{" "}
            {formatDate(
              interview.created_at
            )}
          </p>
        </div>

        {/* OVERALL SCORE */}
        <section className="result-hero">
          <div className="result-score-circle">
            <Award size={25} />

            <strong>
              {hasOverallScore
                ? overallScore.toFixed(1)
                : "—"}
            </strong>

            <span>/10</span>
          </div>

          <div className="result-hero-content">
            <span className="result-card-eyebrow">
              OVERALL PERFORMANCE
            </span>

            <h2>
              {hasOverallScore
                ? overallScore >= 8
                  ? "Excellent performance"
                  : overallScore >= 6
                    ? "Good performance"
                    : "Keep improving"
                : "Evaluation pending"}
            </h2>

            <p>
              You completed{" "}
              <strong>
                {interview.completed_questions || 0}
              </strong>{" "}
              of{" "}
              <strong>
                {interview.question_count || 0}
              </strong>{" "}
              questions.
            </p>
          </div>
        </section>

        {/* SCORE BREAKDOWN */}
        <section className="result-section">
          <div className="result-section-heading">
            <div>
              <span className="result-eyebrow">
                SCORE BREAKDOWN
              </span>

              <h2>
                Your performance
              </h2>
            </div>

            <BarChart3 size={22} />
          </div>

          <div className="result-score-grid">
            <div className="result-score-card">
              <Target size={19} />

              <span>
                Correctness
              </span>

              <strong>
                {score(
                  interview.correctness_score
                )}
              </strong>

              <small>/10</small>
            </div>

            <div className="result-score-card">
              <CheckCircle2 size={19} />

              <span>
                Relevance
              </span>

              <strong>
                {score(
                  interview.relevance_score
                )}
              </strong>

              <small>/10</small>
            </div>

            <div className="result-score-card">
              <Sparkles size={19} />

              <span>
                Clarity
              </span>

              <strong>
                {score(
                  interview.clarity_score
                )}
              </strong>

              <small>/10</small>
            </div>

            <div className="result-score-card">
              <TrendingUp size={19} />

              <span>
                Technical depth
              </span>

              <strong>
                {score(
                  interview.technical_depth_score
                )}
              </strong>

              <small>/10</small>
            </div>
          </div>
        </section>

        {/* QUESTION RESULTS */}
        <section className="result-section">
          <div className="result-section-heading">
            <div>
              <span className="result-eyebrow">
                QUESTION RESULTS
              </span>

              <h2>
                Question-by-question review
              </h2>
            </div>
          </div>

          {evaluations.length === 0 ? (
            <div className="result-empty">
              <FileText size={25} />

              <h3>
                Detailed evaluation unavailable
              </h3>

              <p>
                Question-level feedback will appear
                here when evaluation data is available.
              </p>
            </div>
          ) : (
            <div className="result-evaluation-list">
              {evaluations.map(
                (evaluation, index) => {
                  const evaluationScore =
                    Number(
                      evaluation?.score ??
                        evaluation?.overall_score
                    );

                  const passed =
                    Number.isFinite(
                      evaluationScore
                    ) &&
                    evaluationScore >= 6;

                  return (
                    <div
                      className="result-evaluation-card"
                      key={
                        evaluation?.id ||
                        index
                      }
                    >
                      <div className="result-question-number">
                        {index + 1}
                      </div>

                      <div className="result-evaluation-content">
                        <h3>
                          {evaluation?.question ||
                            `Question ${index + 1}`}
                        </h3>

                        <p>
                          {evaluation?.feedback ||
                            evaluation?.explanation ||
                            "Evaluation details are available for this question."}
                        </p>
                      </div>

                      <div
                        className={`result-evaluation-score ${
                          passed
                            ? "positive"
                            : "needs-work"
                        }`}
                      >
                        {passed ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}

                        <strong>
                          {Number.isFinite(
                            evaluationScore
                          )
                            ? evaluationScore.toFixed(
                                1
                              )
                            : "—"}
                        </strong>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* FEEDBACK */}
        <section className="result-section">
          <div className="result-section-heading">
            <div>
              <span className="result-eyebrow">
                AI INSIGHTS
              </span>

              <h2>
                Improve your next interview
              </h2>
            </div>

            <Lightbulb size={22} />
          </div>

          <div className="result-insight-grid">
            <div className="result-insight-card">
              <div className="result-insight-icon">
                <CheckCircle2 size={19} />
              </div>

              <h3>
                Strengths
              </h3>

              <p>
                Continue practicing the areas where
                you demonstrated strong knowledge and
                clear communication.
              </p>
            </div>

            <div className="result-insight-card">
              <div className="result-insight-icon">
                <TrendingUp size={19} />
              </div>

              <h3>
                Areas to improve
              </h3>

              <p>
                Review questions where your score was
                lower and practice explaining your
                answers with more technical depth.
              </p>
            </div>

            <div className="result-insight-card">
              <div className="result-insight-icon">
                <Lightbulb size={19} />
              </div>

              <h3>
                Next steps
              </h3>

              <p>
                Keep practicing consistently and
                compare your future results to track
                your progress.
              </p>
            </div>
          </div>
        </section>

        <div className="result-actions">
          <button
            type="button"
            className="result-secondary-button"
            onClick={() => navigate("/history")}
          >
            <ArrowLeft size={17} />
            Back to history
          </button>

          <button
            type="button"
            className="result-primary-button"
            onClick={() =>
              navigate("/interview/setup")
            }
          >
            Practice again
            <ChevronRight size={17} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default InterviewResult;