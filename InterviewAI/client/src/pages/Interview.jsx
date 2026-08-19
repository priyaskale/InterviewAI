import {
  Clock3,
  LoaderCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabase";
import { apiRequest } from "../services/api";
import "../styles/interview.css";

const fallbackConfig = {
  jobRole: "Frontend Developer",
  experience: "Fresher",
  interviewType: "Technical",
  difficulty: "Medium",
  questionCount: 10,
};

function Interview() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [config, setConfig] = useState(fallbackConfig);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [isLoadingQuestion, setIsLoadingQuestion] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [evaluation, setEvaluation] =
    useState(null);

  const [evaluationError, setEvaluationError] =
    useState("");

  const [currentQuestion, setCurrentQuestion] =
    useState(1);

  const [evaluations, setEvaluations] =
    useState([]);

  const [isComplete, setIsComplete] =
    useState(false);

  const [interviewId, setInterviewId] =
    useState(null);

  const [isSavingInterview, setIsSavingInterview] =
    useState(false);

  /*
   * Prevent duplicate interview initialization.
   */
  const hasInitialized = useRef(false);

  /*
   * Keep the latest interview ID immediately available.
   */
  const interviewIdRef = useRef(null);

  /*
   * Keep the latest evaluations immediately available.
   */
  const evaluationsRef = useRef([]);

  /*
   * Get the currently authenticated Supabase user.
   */
  const getAuthenticatedUser = useCallback(
    async () => {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(
            "AUTH USER ERROR:",
            error
          );

          return null;
        }

        return authUser;
      } catch (error) {
        console.error(
          "AUTH USER EXCEPTION:",
          error
        );

        return null;
      }
    },
    []
  );

  /*
   * CREATE INTERVIEW
   *
   * The interview row is created BEFORE
   * the first AI question is requested.
   */
  const createInterviewRecord = useCallback(
    async (interviewConfig) => {
      setIsSavingInterview(true);

      try {
        const authUser =
          await getAuthenticatedUser();

        if (!authUser?.id) {
          console.error(
            "Cannot create interview: no authenticated user."
          );

          return null;
        }

        const questionCount =
          Number(
            interviewConfig.questionCount
          ) || 10;

        console.log(
          "Creating interview for user:",
          authUser.id
        );

        const { data, error } =
          await supabase
            .from("interviews")
            .insert({
              user_id: authUser.id,

              job_role:
                interviewConfig.jobRole,

              experience:
                interviewConfig.experience,

              interview_type:
                interviewConfig.interviewType,

              difficulty:
                interviewConfig.difficulty,

              question_count:
                questionCount,

              completed_questions: 0,

              overall_score: 0,

              correctness_score: 0,

              relevance_score: 0,

              clarity_score: 0,

              technical_depth_score: 0,

              evaluations: [],
            })
            .select()
            .single();

        if (error) {
          console.error(
            "INTERVIEW CREATE ERROR:",
            error
          );

          return null;
        }

        console.log(
          "INTERVIEW CREATED:",
          data
        );

        interviewIdRef.current =
          data.id;

        setInterviewId(data.id);

        return data.id;
      } catch (error) {
        console.error(
          "Interview creation error:",
          error
        );

        return null;
      } finally {
        setIsSavingInterview(false);
      }
    },
    [getAuthenticatedUser]
  );

  /*
   * GENERATE ONE INTERVIEW QUESTION
   */
  const generateQuestion = useCallback(
    async (interviewConfig) => {
      setIsLoadingQuestion(true);
      setError("");
      setEvaluation(null);
      setEvaluationError("");
      setAnswer("");

      try {
        const data = await apiRequest(
  "/api/interview/question",
  {
    method: "POST",

    body: JSON.stringify({
      jobRole:
        interviewConfig.jobRole,

      experience:
        interviewConfig.experience,

      interviewType:
        interviewConfig.interviewType,

      difficulty:
        interviewConfig.difficulty,
    }),
  }
);

if (!data.success) {
  throw new Error(
    data?.message ||
      "Failed to generate interview question."
  );
}

        if (!data.question) {
          throw new Error(
            "AI returned an empty interview question."
          );
        }

        setQuestion(
          data.question.trim()
        );
      } catch (error) {
        console.error(
          "Question generation error:",
          error
        );

        setError(
          error?.message ||
            "Unable to connect to the AI interviewer."
        );
      } finally {
        setIsLoadingQuestion(false);
      }
    },
    []
  );

  /*
   * INITIALIZE INTERVIEW
   *
   * 1. Read configuration.
   * 2. Create Supabase interview.
   * 3. Save interview ID.
   * 4. Generate first question.
   */
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    async function initializeInterview() {
      let interviewConfig =
        fallbackConfig;

      const storedConfig =
        sessionStorage.getItem(
          "interviewConfig"
        );

      if (storedConfig) {
        try {
          const parsedConfig =
            JSON.parse(storedConfig);

          interviewConfig = {
            ...fallbackConfig,
            ...parsedConfig,

            questionCount:
              Number(
                parsedConfig.questionCount
              ) || 10,
          };
        } catch (error) {
          console.error(
            "Interview config error:",
            error
          );
        }
      }

      setConfig(interviewConfig);

      /*
       * Create database record first.
       */
      const createdInterviewId =
        await createInterviewRecord(
          interviewConfig
        );

      if (!createdInterviewId) {
        setError(
          "Unable to create your interview session. Please try again."
        );

        setIsLoadingQuestion(false);

        return;
      }

      /*
       * Only generate AI question after
       * the Supabase row exists.
       */
      await generateQuestion(
        interviewConfig
      );
    }

    initializeInterview();
  }, [
    createInterviewRecord,
    generateQuestion,
  ]);

  /*
   * SAVE INTERVIEW PROGRESS
   */
  const saveInterviewProgress =
    useCallback(
      async (updatedEvaluations) => {
        const currentInterviewId =
          interviewIdRef.current;

        if (!currentInterviewId) {
          console.warn(
            "No interview ID available."
          );

          return false;
        }

        try {
          const completed =
            updatedEvaluations.length;

          const totals =
            updatedEvaluations.reduce(
              (result, item) => {
                const itemEvaluation =
                  item?.evaluation || {};

                result.score +=
                  Number(
                    itemEvaluation.score
                  ) || 0;

                result.correctness +=
                  Number(
                    itemEvaluation.correctness
                  ) || 0;

                result.relevance +=
                  Number(
                    itemEvaluation.relevance
                  ) || 0;

                result.clarity +=
                  Number(
                    itemEvaluation.clarity
                  ) || 0;

                result.technicalDepth +=
                  Number(
                    itemEvaluation.technicalDepth
                  ) || 0;

                return result;
              },
              {
                score: 0,
                correctness: 0,
                relevance: 0,
                clarity: 0,
                technicalDepth: 0,
              }
            );

          const average = (value) => {
            if (!completed) {
              return 0;
            }

            return Number(
              (
                value / completed
              ).toFixed(1)
            );
          };

          const authUser =
            await getAuthenticatedUser();

          if (!authUser?.id) {
            console.error(
              "Cannot save progress: user not authenticated."
            );

            return false;
          }

          const updatePayload = {
            completed_questions:
              completed,

            overall_score:
              average(
                totals.score
              ),

            correctness_score:
              average(
                totals.correctness
              ),

            relevance_score:
              average(
                totals.relevance
              ),

            clarity_score:
              average(
                totals.clarity
              ),

            technical_depth_score:
              average(
                totals.technicalDepth
              ),

            evaluations:
              updatedEvaluations,
          };

          console.log(
            "Saving interview progress:",
            updatePayload
          );

          const {
            data,
            error,
          } = await supabase
            .from("interviews")
            .update(updatePayload)
            .eq(
              "id",
              currentInterviewId
            )
            .eq(
              "user_id",
              authUser.id
            )
            .select()
            .single();

          if (error) {
            console.error(
              "INTERVIEW UPDATE ERROR:",
              error
            );

            return false;
          }

          console.log(
            "INTERVIEW PROGRESS SAVED:",
            data
          );

          return true;
        } catch (error) {
          console.error(
            "Interview progress error:",
            error
          );

          return false;
        }
      },
      [getAuthenticatedUser]
    );

  /*
   * SUBMIT ANSWER
   */
  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !answer.trim() ||
      !question ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);
    setEvaluation(null);
    setEvaluationError("");

    try {
      const data = await apiRequest(
  "/api/interview/evaluate",
  {
    method: "POST",

    body: JSON.stringify({
      jobRole:
        config.jobRole,

      question,

      answer:
        answer.trim(),

      difficulty:
        config.difficulty,
    }),
  }
);

if (!data.success) {
  throw new Error(
    data?.message ||
      "Failed to evaluate your answer."
  );
}

      if (!data.evaluation) {
        throw new Error(
          "AI returned an empty evaluation."
        );
      }

      const newEvaluation = {
        questionNumber:
          currentQuestion,

        question,

        answer:
          answer.trim(),

        evaluation:
          data.evaluation,
      };

      /*
       * IMPORTANT:
       * Always build the next array from
       * the ref, so we never lose the
       * latest evaluation because of
       * React state timing.
       */
      const updatedEvaluations = [
        ...evaluationsRef.current,
        newEvaluation,
      ];

      evaluationsRef.current =
        updatedEvaluations;

      setEvaluations(
        updatedEvaluations
      );

      setEvaluation(
        data.evaluation
      );

      /*
       * Save immediately after evaluation.
       */
      const saved =
        await saveInterviewProgress(
          updatedEvaluations
        );

      if (!saved) {
        setEvaluationError(
          "Your answer was evaluated, but we could not save the interview progress."
        );
      }
    } catch (error) {
      console.error(
        "Answer evaluation error:",
        error
      );

      setEvaluationError(
        error?.message ||
          "Unable to evaluate your answer. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * NEXT QUESTION / FINISH
   */
  async function handleNextQuestion() {
    if (
      currentQuestion >=
      config.questionCount
    ) {
      /*
       * Make absolutely sure the final
       * evaluation is saved.
       */
      const finalEvaluations =
        evaluationsRef.current;

      await saveInterviewProgress(
        finalEvaluations
      );

      setIsComplete(true);

      return;
    }

    const nextQuestionNumber =
      currentQuestion + 1;

    setCurrentQuestion(
      nextQuestionNumber
    );

    await generateQuestion(
      config
    );
  }

  /*
   * EXIT INTERVIEW
   */
  function handleExit() {
    const shouldExit =
      window.confirm(
        "Are you sure you want to leave this interview?"
      );

    if (shouldExit) {
      navigate("/dashboard");
    }
  }

  /*
   * FINAL RESULTS CALCULATIONS
   */
  const finalResults =
    evaluations.reduce(
      (totals, item) => {
        const result =
          item?.evaluation || {};

        totals.score +=
          Number(result.score) || 0;

        totals.correctness +=
          Number(
            result.correctness
          ) || 0;

        totals.relevance +=
          Number(
            result.relevance
          ) || 0;

        totals.clarity +=
          Number(
            result.clarity
          ) || 0;

        totals.technicalDepth +=
          Number(
            result.technicalDepth
          ) || 0;

        return totals;
      },
      {
        score: 0,
        correctness: 0,
        relevance: 0,
        clarity: 0,
        technicalDepth: 0,
      }
    );

  const completedQuestions =
    evaluations.length;

  const average = (value) => {
    if (!completedQuestions) {
      return 0;
    }

    return Number(
      (
        value /
        completedQuestions
      ).toFixed(1)
    );
  };

  const overallScore =
    average(
      finalResults.score
    );

  const averageCorrectness =
    average(
      finalResults.correctness
    );

  const averageRelevance =
    average(
      finalResults.relevance
    );

  const averageClarity =
    average(
      finalResults.clarity
    );

  const averageTechnicalDepth =
    average(
      finalResults.technicalDepth
    );

  const candidateName =
    user?.user_metadata
      ?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split(
      "@"
    )[0] ||
    "Candidate";

  /*
   * FINAL RESULTS SCREEN
   */
  if (isComplete) {
    return (
      <div className="interview-page">
        <header className="interview-topbar">
          <div />

          <div className="interview-brand">
            <div className="interview-brand-icon">
              <Sparkles size={17} />
            </div>

            <span>
              InterviewAI
            </span>
          </div>

          <div className="interview-candidate">
            <div className="interview-avatar">
              {candidateName
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="results-main">
          <div className="results-heading">
            <span className="results-eyebrow">
              INTERVIEW COMPLETE
            </span>

            <h1>
              Great job,{" "}
              {
                candidateName.split(
                  " "
                )[0]
              }
              !
            </h1>

            <p>
              You've completed all{" "}
              {
                config.questionCount
              }{" "}
              interview questions.
              Here's your
              performance summary.
            </p>
          </div>

          <section className="results-score-card">
            <div className="results-score">
              <span>
                Overall score
              </span>

              <strong>
                {overallScore}
              </strong>

              <small>
                /10
              </small>
            </div>

            <div className="results-score-message">
              {overallScore >= 8
                ? "Excellent performance"
                : overallScore >= 6
                  ? "Good performance"
                  : "Keep practicing"}
            </div>
          </section>

          <section className="results-metrics">
            <div className="results-metric-card">
              <span>
                Correctness
              </span>

              <strong>
                {
                  averageCorrectness
                }
                /10
              </strong>
            </div>

            <div className="results-metric-card">
              <span>
                Relevance
              </span>

              <strong>
                {
                  averageRelevance
                }
                /10
              </strong>
            </div>

            <div className="results-metric-card">
              <span>
                Clarity
              </span>

              <strong>
                {
                  averageClarity
                }
                /10
              </strong>
            </div>

            <div className="results-metric-card">
              <span>
                Technical depth
              </span>

              <strong>
                {
                  averageTechnicalDepth
                }
                /10
              </strong>
            </div>
          </section>

          <section className="results-summary-card">
            <div className="results-section-heading">
              <h2>
                Interview summary
              </h2>

              <span>
                {
                  completedQuestions
                }
                /
                {
                  config.questionCount
                }{" "}
                completed
              </span>
            </div>

            <div className="results-question-list">
              {evaluations.map(
                (item) => (
                  <div
                    className="results-question"
                    key={
                      item.questionNumber
                    }
                  >
                    <div className="results-question-number">
                      {String(
                        item.questionNumber
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="results-question-content">
                      <h3>
                        {
                          item.question
                        }
                      </h3>

                      <span>
                        Score:{" "}
                        {
                          item
                            .evaluation
                            ?.score ??
                          0
                        }
                        /10
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          <div className="results-actions">
            <button
              type="button"
              className="results-dashboard-button"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              Back to dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  /*
   * INTERVIEW SCREEN
   */
  return (
    <div className="interview-page">
      <header className="interview-topbar">
        <button
          className="interview-exit-button"
          onClick={handleExit}
        >
          <X size={18} />
          Exit interview
        </button>

        <div className="interview-brand">
          <div className="interview-brand-icon">
            <Sparkles size={17} />
          </div>

          <span>
            InterviewAI
          </span>
        </div>

        <div className="interview-candidate">
          <div className="interview-avatar">
            {candidateName
              .charAt(0)
              .toUpperCase()}
          </div>
        </div>
      </header>

      <main className="interview-main">
        <div className="interview-progress-section">
          <div className="interview-progress-top">
            <div>
              <span className="progress-label">
                QUESTION{" "}
                {
                  currentQuestion
                }{" "}
                OF{" "}
                {
                  config.questionCount
                }
              </span>

              <h1>
                {config.jobRole}
              </h1>
            </div>

            <div className="interview-meta">
              <span>
                {
                  config.interviewType
                }
              </span>

              <span>
                {
                  config.difficulty
                }
              </span>
            </div>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (currentQuestion /
                    config.questionCount) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <section className="interview-workspace">
          <div className="ai-question-card">
            <div className="ai-question-header">
              <div className="ai-avatar">
                {isLoadingQuestion ? (
                  <LoaderCircle
                    size={21}
                    className="question-loader"
                  />
                ) : (
                  <Sparkles size={21} />
                )}
              </div>

              <div>
                <strong>
                  AI Interviewer
                </strong>

                <span>
                  {isLoadingQuestion
                    ? "Generating your question..."
                    : "Ask anything. Take your time."}
                </span>
              </div>

              {!isLoadingQuestion &&
                !error && (
                  <div className="live-indicator">
                    <span />
                    Live
                  </div>
                )}
            </div>

            <div className="question-content">
              <span className="question-number">
                Question{" "}
                {String(
                  currentQuestion
                ).padStart(
                  2,
                  "0"
                )}
              </span>

              {isLoadingQuestion ? (
                <div className="question-loading">
                  <LoaderCircle
                    size={24}
                    className="question-loader"
                  />

                  <p>
                    AI is preparing
                    your interview
                    question...
                  </p>
                </div>
              ) : error ? (
                <div className="question-error">
                  <h2>
                    Unable to load
                    the question
                  </h2>

                  <p>
                    {error}
                  </p>

                  <button
                    type="button"
                    className="retry-button"
                    onClick={() =>
                      generateQuestion(
                        config
                      )
                    }
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  <h2>
                    {question}
                  </h2>

                  <p>
                    Take a moment to
                    organize your
                    thoughts before
                    answering. Try
                    to keep your
                    response clear
                    and relevant to
                    the role.
                  </p>
                </>
              )}
            </div>

            {!isLoadingQuestion &&
              !error && (
                <div className="question-tip">
                  <Sparkles
                    size={15}
                  />

                  <span>
                    Tip: Give a clear
                    answer and use a
                    practical example
                    when possible.
                  </span>
                </div>
              )}
          </div>

          {!evaluation ? (
            <form
              className="answer-card"
              onSubmit={
                handleSubmit
              }
            >
              <div className="answer-header">
                <div>
                  <h3>
                    Your answer
                  </h3>

                  <p>
                    Answer as if you
                    were speaking to
                    a real
                    interviewer.
                  </p>
                </div>

                <div className="answer-time">
                  <Clock3
                    size={14}
                  />

                  <span>
                    Untimed
                  </span>
                </div>
              </div>

              <textarea
                value={answer}
                onChange={(
                  event
                ) =>
                  setAnswer(
                    event.target
                      .value
                  )
                }
                placeholder="Start typing your answer here..."
                maxLength={2000}
                disabled={
                  isLoadingQuestion ||
                  !!error ||
                  isSubmitting ||
                  isSavingInterview
                }
              />

              {evaluationError && (
                <div className="evaluation-error">
                  {
                    evaluationError
                  }
                </div>
              )}

              <div className="answer-footer">
                <span>
                  {answer.length}
                  /2000 characters
                </span>

                <button
                  type="submit"
                  className="submit-answer-button"
                  disabled={
                    !answer.trim() ||
                    isSubmitting ||
                    isLoadingQuestion ||
                    !!error ||
                    !interviewId
                  }
                >
                  {isSubmitting
                    ? "Evaluating..."
                    : "Submit answer"}

                  {isSubmitting ? (
                    <LoaderCircle
                      size={16}
                      className="question-loader"
                    />
                  ) : (
                    <Send
                      size={16}
                    />
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="evaluation-card">
              <div className="evaluation-header">
                <div>
                  <div className="evaluation-title">
                    <div className="evaluation-icon">
                      <Sparkles
                        size={18}
                      />
                    </div>

                    <div>
                      <span>
                        AI Evaluation
                      </span>

                      <p>
                        Here's how your
                        answer performed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="evaluation-score">
                  <strong>
                    {
                      evaluation.score
                    }
                  </strong>

                  <span>
                    /10
                  </span>
                </div>
              </div>

              <div className="evaluation-metrics">
                <div className="evaluation-metric">
                  <span>
                    Correctness
                  </span>

                  <strong>
                    {
                      evaluation.correctness
                    }
                    /10
                  </strong>
                </div>

                <div className="evaluation-metric">
                  <span>
                    Relevance
                  </span>

                  <strong>
                    {
                      evaluation.relevance
                    }
                    /10
                  </strong>
                </div>

                <div className="evaluation-metric">
                  <span>
                    Clarity
                  </span>

                  <strong>
                    {
                      evaluation.clarity
                    }
                    /10
                  </strong>
                </div>

                <div className="evaluation-metric">
                  <span>
                    Technical depth
                  </span>

                  <strong>
                    {
                      evaluation.technicalDepth
                    }
                    /10
                  </strong>
                </div>
              </div>

              <div className="evaluation-section">
                <h4>
                  Feedback
                </h4>

                <p>
                  {
                    evaluation.feedback
                  }
                </p>
              </div>

              {evaluation.strengths?.length >
                0 && (
                <div className="evaluation-section">
                  <h4>
                    Strengths
                  </h4>

                  <ul>
                    {evaluation.strengths.map(
                      (
                        strength,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {
                            strength
                          }
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {evaluation.improvements?.length >
                0 && (
                <div className="evaluation-section">
                  <h4>
                    Areas to
                    improve
                  </h4>

                  <ul>
                    {evaluation.improvements.map(
                      (
                        improvement,
                        index
                      ) => (
                        <li
                          key={
                            index
                          }
                        >
                          {
                            improvement
                          }
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              <div className="evaluation-actions">
                <button
                  type="button"
                  className="next-question-button"
                  onClick={
                    handleNextQuestion
                  }
                >
                  {currentQuestion >=
                  config.questionCount
                    ? "Finish interview"
                    : "Next question"}

                  <Send
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Interview;