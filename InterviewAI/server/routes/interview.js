const express = require("express");

const router = express.Router();

router.post("/question", async (req, res) => {
  try {
    const {
      jobRole,
      experience,
      interviewType,
      difficulty,
    } = req.body;

    if (!jobRole || !experience || !interviewType || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Interview configuration is incomplete.",
      });
    }

    const prompt = `
You are a professional AI interviewer.

Generate ONE interview question for the candidate.

Job role: ${jobRole}
Experience level: ${experience}
Interview type: ${interviewType}
Difficulty: ${difficulty}

Rules:
- Ask exactly ONE question.
- Make it appropriate for the selected role and experience.
- Do not provide the answer.
- Do not add explanations.
- Return only the interview question.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5174",
          "X-Title": "InterviewAI",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return res.status(response.status).json({
        success: false,
        message:
          data?.error?.message ||
          "OpenRouter request failed.",
      });
    }

    const question =
      data?.choices?.[0]?.message?.content?.trim();

    if (!question) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter returned an empty question.",
      });
    }

    return res.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("OpenRouter question error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to generate interview question.",
    });
  }
});

router.post("/evaluate", async (req, res) => {
  try {
    const {
      question,
      answer,
      jobRole,
    } = req.body;

    if (!question || !answer || !jobRole) {
      return res.status(400).json({
        success: false,
        message: "Question, answer, and job role are required.",
      });
    }

    const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

Job role: ${jobRole}

Interview question:
${question}

Candidate answer:
${answer}

Evaluate the answer using these criteria:
1. Correctness
2. Relevance
3. Clarity
4. Technical depth

Return ONLY valid JSON in exactly this structure:

{
  "score": 0,
  "correctness": 0,
  "relevance": 0,
  "clarity": 0,
  "technicalDepth": 0,
  "feedback": "Short constructive feedback.",
  "strengths": [
    "Strength 1"
  ],
  "improvements": [
    "Improvement 1"
  ]
}

All scores must be integers from 0 to 10.
Do not include markdown.
Do not include any text outside the JSON.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:5174",
          "X-Title": "InterviewAI",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter evaluation error:", data);

      return res.status(response.status).json({
        success: false,
        message:
          data?.error?.message ||
          "OpenRouter evaluation failed.",
      });
    }

    const rawResult =
      data?.choices?.[0]?.message?.content?.trim();

    if (!rawResult) {
      return res.status(500).json({
        success: false,
        message: "OpenRouter returned an empty evaluation.",
      });
    }

    let evaluation;

    try {
      evaluation = JSON.parse(rawResult);
    } catch (parseError) {
      console.error("Evaluation JSON parse error:", rawResult);

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid evaluation format.",
      });
    }

    return res.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("Evaluation error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to evaluate the answer.",
    });
  }
});

module.exports = router;