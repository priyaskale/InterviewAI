import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  FileQuestion,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/interview-setup.css";

const jobRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "UI/UX Designer",
  "Software Engineer",
];

const experienceLevels = [
  "Fresher",
  "0–1 years",
  "1–3 years",
  "3–5 years",
  "5+ years",
];

const interviewTypes = [
  "Technical",
  "Behavioral",
  "HR",
  "Mixed",
];

const difficulties = [
  "Easy",
  "Medium",
  "Hard",
];

const questionCounts = [5, 10, 15];

function SelectField({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}) {
  return (
    <div className="setup-field">
      <label>{label}</label>

      <div className="select-wrapper">
        <Icon size={18} />

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          className="select-arrow"
        />
      </div>
    </div>
  );
}

function InterviewSetup() {
  const navigate = useNavigate();

  const [jobRole, setJobRole] = useState(jobRoles[0]);
  const [experience, setExperience] = useState(
    experienceLevels[0]
  );
  const [interviewType, setInterviewType] = useState(
    interviewTypes[0]
  );
  const [difficulty, setDifficulty] = useState(
    difficulties[1]
  );
  const [questionCount, setQuestionCount] = useState(
    questionCounts[1]
  );

  function handleStartInterview() {
    const interviewConfig = {
      jobRole,
      experience,
      interviewType,
      difficulty,
      questionCount,
    };

    console.log(
      "Starting interview with config:",
      interviewConfig
    );

    sessionStorage.setItem(
      "interviewConfig",
      JSON.stringify(interviewConfig)
    );

    navigate("/interview");
  }

  return (
    <div className="setup-page">
      <header className="setup-topbar">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="setup-brand">
          <div className="setup-brand-icon">
            <Sparkles size={17} />
          </div>

          <span>InterviewAI</span>
        </div>

        <div className="setup-step">
          Step 1 of 2
        </div>
      </header>

      <main className="setup-main">
        <div className="setup-heading">
          <div className="setup-badge">
            <Sparkles size={14} />
            AI Interview
          </div>

          <h1>Set up your interview</h1>

          <p>
            Customize your practice session to match the
            role you're preparing for.
          </p>
        </div>

        <div className="setup-layout">
          <section className="setup-card">
            <div className="setup-card-header">
              <div>
                <h2>Interview details</h2>

                <p>
                  Choose the options for your practice
                  session.
                </p>
              </div>
            </div>

            <div className="setup-fields">
              <SelectField
                label="Job role"
                icon={BriefcaseBusiness}
                value={jobRole}
                options={jobRoles}
                onChange={setJobRole}
              />

              <SelectField
                label="Experience level"
                icon={Clock3}
                value={experience}
                options={experienceLevels}
                onChange={setExperience}
              />

              <SelectField
                label="Interview type"
                icon={FileQuestion}
                value={interviewType}
                options={interviewTypes}
                onChange={setInterviewType}
              />

              <div className="setup-field">
                <label>Difficulty</label>

                <div className="option-group">
                  {difficulties.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={
                        difficulty === option
                          ? "option-button selected"
                          : "option-button"
                      }
                      onClick={() =>
                        setDifficulty(option)
                      }
                    >
                      {difficulty === option && (
                        <Check size={15} />
                      )}

                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setup-field">
                <label>Number of questions</label>

                <div className="option-group question-options">
                  {questionCounts.map((count) => (
                    <button
                      key={count}
                      type="button"
                      className={
                        questionCount === count
                          ? "option-button selected"
                          : "option-button"
                      }
                      onClick={() =>
                        setQuestionCount(count)
                      }
                    >
                      {questionCount === count && (
                        <Check size={15} />
                      )}

                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="setup-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button setup-start-button"
                onClick={handleStartInterview}
              >
                Start interview
                <Sparkles size={17} />
              </button>
            </div>
          </section>

          <aside className="interview-preview">
            <div className="preview-icon">
              <Sparkles size={22} />
            </div>

            <h3>Your AI interviewer</h3>

            <p>
              Your interview will adapt to your selected
              role, experience, interview type, and
              difficulty.
            </p>

            <div className="preview-list">
              <div>
                <Check size={15} />
                <span>
                  Realistic interview questions
                </span>
              </div>

              <div>
                <Check size={15} />
                <span>Follow-up questions</span>
              </div>

              <div>
                <Check size={15} />
                <span>Personalized feedback</span>
              </div>

              <div>
                <Check size={15} />
                <span>Performance score</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default InterviewSetup;