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

  function getEvaluationData(item) {
    if (!item) {
      return {};
    }

    /*
     * Current Interview.jsx stores:
     *
     * {
     *   questionNumber,
     *   question,
     *   answer,
     *   evaluation: {
     *     score,
     *     correctness,
     *     relevance,
     *     clarity,
     *     technicalDepth,
     *     feedback,
     *     strengths,
     *     improvements
     *   }
     * }
     */

    if (item.evaluation) {
      return item.evaluation;
    }

    /*
     * Compatibility with older saved formats.
     */
    return item;
  }

  function getOverallMessage(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "Evaluation pending";
    }

    if (number >= 8) {
      return "Excellent performance";
    }

    if (number >= 6) {
      return "Good performance";
    }

    if (number >= 4) {
      return "Fair performance";
    }

    return "Keep improving";
  }

  function getOverallAdvice(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "Complete your interview evaluation to receive personalized feedback.";
    }

    if (number >= 8) {
      return "Excellent work. Keep practicing to maintain this level of performance.";
    }

    if (number >= 6) {
      return "You have a solid foundation. Focus on improving technical depth and consistency.";
    }

    return "Keep practicing the fundamentals and focus on answering each question directly.";
  }

  if (isLoading) {
    return (
      <div className="result-loading">
        <div className="result-loading-spinner" />

        <p>
          Loading your interview result...
        </p>
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
            type="button"
            className="result-primary-button"
            onClick={() =>
              navigate("/history")
            }
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

  const completedQuestions =
    Number(interview.completed_questions) || 0;

  const totalQuestions =
    Number(interview.question_count) || 0;

  /*
   * Build overall strengths and improvements
   * from the actual saved AI evaluations.
   */
  const allStrengths = evaluations.flatMap(
    (item) => {
      const evaluation =
        getEvaluationData(item);

      return Array.isArray(
        evaluation?.strengths
      )
        ? evaluation.strengths
        : [];
    }
  );

  const allImprovements = evaluations.flatMap(
    (item) => {
      const evaluation =
        getEvaluationData(item);

      return Array.isArray(
        evaluation?.improvements
      )
        ? evaluation.improvements
        : [];
    }
  );

  const uniqueStrengths = [
    ...new Set(allStrengths),
  ].slice(0, 5);

  const uniqueImprovements = [
    ...new Set(allImprovements),
  ].slice(0, 5);

  return (
    <div className="result-page">
      <header className="result-topbar">
        <button
          type="button"
          className="result-back-button"
          onClick={() =>
            navigate("/history")
          }
        >
          <ArrowLeft size={18} />
          History
        </button>

        <div className="result-brand">
          <div className="result-brand-icon">
            <Sparkles size={17} />
          </div>

          <span>
            InterviewAI
          </span>
        </div>

        <div />
      </header>

      <main className="result-main">
        {/* HEADER */}
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
              {getOverallMessage(
                overallScore
              )}
            </h2>

            <p>
              You completed{" "}
              <strong>
                {completedQuestions}
              </strong>{" "}
              of{" "}
              <strong>
                {totalQuestions}
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
                Question-level feedback will
                appear here when evaluation
                data is available.
              </p>
            </div>
          ) : (
            <div className="result-evaluation-list">
              {evaluations.map(
                (item, index) => {
                  const evaluation =
                    getEvaluationData(item);

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

                  const questionNumber =
                    Number(
                      item?.questionNumber
                    ) || index + 1;

                  return (
                    <article
                      className="result-evaluation-card"
                      key={
                        item?.id ||
                        `${questionNumber}-${index}`
                      }
                    >
                      {/* QUESTION HEADER */}
                      <div className="result-question-header">
                        <div className="result-question-number">
                          {questionNumber}
                        </div>

                        <div className="result-evaluation-content">
                          <h3>
                            {item?.question ||
                              `Question ${
                                questionNumber
                              }`}
                          </h3>

                          <div
                            className={`result-evaluation-score ${
                              passed
                                ? "positive"
                                : "needs-work"
                            }`}
                          >
                            {passed ? (
                              <CheckCircle2
                                size={16}
                              />
                            ) : (
                              <XCircle
                                size={16}
                              />
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

                            <span>
                              /10
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ANSWER */}
                      {item?.answer && (
                        <div className="result-detail-section">
                          <h4>
                            Your answer
                          </h4>

                          <p>
                            {item.answer}
                          </p>
                        </div>
                      )}

                      {/* METRICS */}
                      <div className="result-detail-metrics">
                        <div className="result-detail-metric">
                          <span>
                            Correctness
                          </span>

                          <strong>
                            {score(
                              evaluation?.correctness
                            )}
                            /10
                          </strong>
                        </div>

                        <div className="result-detail-metric">
                          <span>
                            Relevance
                          </span>

                          <strong>
                            {score(
                              evaluation?.relevance
                            )}
                            /10
                          </strong>
                        </div>

                        <div className="result-detail-metric">
                          <span>
                            Clarity
                          </span>

                          <strong>
                            {score(
                              evaluation?.clarity
                            )}
                            /10
                          </strong>
                        </div>

                        <div className="result-detail-metric">
                          <span>
                            Technical depth
                          </span>

                          <strong>
                            {score(
                              evaluation?.technicalDepth
                            )}
                            /10
                          </strong>
                        </div>
                      </div>

                      {/* FEEDBACK */}
                      {evaluation?.feedback && (
                        <div className="result-detail-section">
                          <h4>
                            Feedback
                          </h4>

                          <p>
                            {
                              evaluation.feedback
                            }
                          </p>
                        </div>
                      )}

                      {/* STRENGTHS */}
                      {Array.isArray(
                        evaluation?.strengths
                      ) &&
                        evaluation.strengths.length >
                          0 && (
                          <div className="result-detail-section">
                            <h4>
                              Strengths
                            </h4>

                            <ul>
                              {evaluation.strengths.map(
                                (
                                  strength,
                                  strengthIndex
                                ) => (
                                  <li
                                    key={
                                      strengthIndex
                                    }
                                  >
                                    {strength}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* IMPROVEMENTS */}
                      {Array.isArray(
                        evaluation?.improvements
                      ) &&
                        evaluation.improvements
                          .length > 0 && (
                          <div className="result-detail-section">
                            <h4>
                              Areas to improve
                            </h4>

                            <ul>
                              {evaluation.improvements.map(
                                (
                                  improvement,
                                  improvementIndex
                                ) => (
                                  <li
                                    key={
                                      improvementIndex
                                    }
                                  >
                                    {improvement}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* AI INSIGHTS */}
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
            {/* STRENGTHS */}
            <div className="result-insight-card">
              <div className="result-insight-icon">
                <CheckCircle2 size={19} />
              </div>

              <h3>
                Strengths
              </h3>

              {uniqueStrengths.length >
              0 ? (
                <ul>
                  {uniqueStrengths.map(
                    (
                      strength,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {strength}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  Continue practicing the
                  areas where you demonstrate
                  strong knowledge and clear
                  communication.
                </p>
              )}
            </div>

            {/* IMPROVEMENTS */}
            <div className="result-insight-card">
              <div className="result-insight-icon">
                <TrendingUp size={19} />
              </div>

              <h3>
                Areas to improve
              </h3>

              {uniqueImprovements.length >
              0 ? (
                <ul>
                  {uniqueImprovements.map(
                    (
                      improvement,
                      index
                    ) => (
                      <li
                        key={index}
                      >
                        {improvement}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  Review questions where
                  your score was lower and
                  practice explaining your
                  answers with more technical
                  depth.
                </p>
              )}
            </div>

            {/* NEXT STEPS */}
            <div className="result-insight-card">
              <div className="result-insight-icon">
                <Lightbulb size={19} />
              </div>

              <h3>
                Next steps
              </h3>

              <p>
                {getOverallAdvice(
                  overallScore
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <div className="result-actions">
          <button
            type="button"
            className="result-secondary-button"
            onClick={() =>
              navigate("/history")
            }
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
