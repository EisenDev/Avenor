interface GeminiResult {
  score: string
  feedback: {
    good: string[]
    bad: string[]
    improve: string[]
  }
}

/**
 * Analyzes a document (e.g. PDF/TXT) using the Gemini API.
 * Uses the configured API key and model from environment variables.
 * Throws an error if credentials are missing or the API call fails.
 */
export async function analyzeDocumentWithGemini(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY
  // Fallback to configured model or 'gemini-2.5-flash'
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.')
  }

  try {
    const base64Data = fileBuffer.toString('base64')

    // Prepare system instructions and prompt
    const promptText = `
You are an expert resume reviewer and career coach.
Analyze this job application document (named "${fileName}").
Please grade the document on standard professional benchmarks (e.g. formatting, impact, keywords, structure) and return a score out of 100, a list of what's good (strong points), a list of what's bad (weak points), and a list of specific actionable recommendations.

You must respond in strict JSON format matching this schema:
{
  "score": number,
  "good": [string],
  "bad": [string],
  "improve": [string]
}
`

    // Determine safe mimeType or default to application/pdf for Gemini inlineData
    let cleanMime = mimeType
    if (!mimeType || mimeType === 'application/octet-stream') {
      cleanMime = fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain'
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMime,
                    data: base64Data,
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errText}`)
    }

    const resJson = await response.json()
    const textContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Parse response
    const parsed = JSON.parse(textContent)
    if (
      typeof parsed.score === 'number' &&
      Array.isArray(parsed.good) &&
      Array.isArray(parsed.bad) &&
      Array.isArray(parsed.improve)
    ) {
      return {
        score: `${parsed.score}%`,
        feedback: {
          good: parsed.good,
          bad: parsed.bad,
          improve: parsed.improve,
        },
      }
    }

    throw new Error('Invalid JSON format returned from Gemini')
  } catch (error) {
    console.error('Failed to perform AI document analysis with Gemini:', error)
    throw error
  }
}

interface ParsedOfferResult {
  company: string
  role: string
  baseSalary: number
  bonus: number
  equity: number
  location: string
}

/**
 * Parses an offer letter file (PDF/Image) using Gemini to extract compensation parameters.
 */
export async function parseOfferLetterWithGemini(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParsedOfferResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.')
  }

  try {
    const base64Data = fileBuffer.toString('base64')

    const promptText = `
You are an expert recruitment coordinator. Analyze this official job offer document (named "${fileName}").
Please extract the following properties from the text:
1. Company Name (e.g. Stripe, Google)
2. Role Title (e.g. Research Engineer, Software Engineer II)
3. Base Salary (numerical annual value, e.g. 145000, 160000. If hourly, calculate annual assuming 2000 hours per year)
4. Annual Bonus (numerical annual value, default to 0 if not specified)
5. Equity Value (total dollar value of equity/RSUs granted over the entire vesting period, e.g. 150000. Default to 0)
6. Work Location (Determine if "Remote", "Hybrid", or "Onsite")

You must respond in strict JSON format matching this schema:
{
  "company": string,
  "role": string,
  "baseSalary": number,
  "bonus": number,
  "equity": number,
  "location": string
}
`

    let cleanMime = mimeType
    if (!mimeType || mimeType === 'application/octet-stream') {
      cleanMime = fileName.endsWith('.pdf') ? 'application/pdf' : 'text/plain'
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMime,
                    data: base64Data,
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errText}`)
    }

    const resJson = await response.json()
    const textContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsed = JSON.parse(textContent)

    return {
      company: parsed.company || 'Unknown Company',
      role: parsed.role || 'Software Engineer',
      baseSalary: Number(parsed.baseSalary) || 0,
      bonus: Number(parsed.bonus) || 0,
      equity: Number(parsed.equity) || 0,
      location: parsed.location || 'Onsite',
    }
  } catch (error) {
    console.error('Failed to parse offer letter with Gemini:', error)
    throw error
  }
}

/**
 * Evaluates an offer, compares it to competing offers, assigns a Quality Score (1-100), and drafts a negotiation email.
 */
export async function generateNegotiationWithGemini(
  offer: { company: string; role: string; baseSalary: number; bonus: number; equity: number; location: string },
  otherOffers: Array<{ company: string; role: string; baseSalary: number; bonus: number; equity: number; location: string }>
): Promise<{ score: number; explanation: string; negotiationEmail: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }

  try {
    const targetInfo = `${offer.company} (${offer.role}): Base $${offer.baseSalary}/yr, Bonus $${offer.bonus}/yr, Equity $${offer.equity} (total), Location: ${offer.location}`
    const comparisonList = otherOffers
      .map(o => `- ${o.company} (${o.role}): Base $${o.baseSalary}/yr, Bonus $${o.bonus}/yr, Equity $${o.equity} (total), Location: ${o.location}`)
      .join('\n')

    const promptText = `
You are an elite executive career negotiation coach. Analyze the following job offer:
Target Offer to Negotiate:
${targetInfo}

Other Competing Active Offers:
${comparisonList || "No other competing active offers."}

Tasks:
1. Grade the quality of this target offer package out of 100. Consider base compensation, structure, location, and the leverage from any other active offers. (e.g., if there are competing offers with higher bases, rate lower or explain how it can be negotiated). Return score as an integer.
2. Write a brief explanation (2-3 sentences) detailing why you gave this score (pros, cons, and optimization opportunities). Keep it simple, clear, and easy for anyone to understand.
3. Write a highly professional, polite, and persuasive recruiter email draft negotiating this target offer.
   - If there are other competing offers, use them as leverage to ask for a bump in base salary or RSU equity value.
   - Do not make it sound demanding; keep it collaborative, showing high excitement for the role while explaining the market matching context.
   - Use place holders like [Recruiter Name] where appropriate.

You must respond in strict JSON format matching this schema:
{
  "score": number,
  "explanation": string,
  "negotiationEmail": string
}
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errText}`)
    }

    const resJson = await response.json()
    const textContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsed = JSON.parse(textContent)

    return {
      score: Number(parsed.score) || 75,
      explanation: parsed.explanation || 'Competitive base salary matching industry standards.',
      negotiationEmail: parsed.negotiationEmail || '',
    }
  } catch (error) {
    console.error('Failed to generate negotiation strategy with Gemini:', error)
    return {
      score: 75,
      explanation: 'Competitive base salary matching industry standards.',
      negotiationEmail: `Dear Recruiting Team,\n\nThank you so much for extending the offer for the ${offer.role} role at ${offer.company}. I am incredibly excited about the opportunity to join the team.\n\nBefore finalizing, I wanted to discuss if there is any flexibility to align the compensation package closer with market standards and competing proposals I am currently evaluating. Specifically, is there room to increase the base salary or equity component?\n\nThank you for your time and guidance!\n\nBest regards,\n[Your Name]`,
    }
  }
}

/**
 * Reviews job search progress statistics and returns a short, highly-actionable career coach analysis.
 */
export async function generateCareerCoachingWithGemini(data: {
  applicationsCount: number
  interviewsCount: number
  offersCount: number
  salaryTarget: number
  currentMaxSalary: number
  statusesSummary: string
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }

  try {
    const promptText = `
You are a highly supportive, elite tech career coach. Review this job seeker's current search checkpoints:
- Total Job Applications: ${data.applicationsCount}
- Active Interviews: ${data.interviewsCount}
- Job Offers Received: ${data.offersCount}
- Target Salary: $${data.salaryTarget.toLocaleString()}/yr
- Highest Offer Base Salary: $${data.currentMaxSalary.toLocaleString()}/yr
- Status Breakdown: ${data.statusesSummary}

Task:
Write a brief, highly actionable career advice paragraph (2-3 sentences max) to guide their next steps.
- Focus on conversion bottlenecks (e.g., if applications are high but interviews are low, recommend resume/tailoring tweaks. If interviews are high but offers are low, suggest mock prep).
- If offers are received, suggest leverage/negotiation.
- Keep it direct, motivating, and professional. Start directly with the advice (no "Here is my advice" filler).
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errText}`)
    }

    const resJson = await response.json()
    const textContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return textContent.trim()
  } catch (error) {
    console.error('Failed to generate career coaching advice:', error)
    return 'Your pipeline looks steady. Keep applying to highly relevant roles and ensure your resume contains keywords from the job description to improve interview conversion rates.'
  }
}

interface InterviewTurnResult {
  question: string
  isEnded: boolean
}

/**
 * Generates the next natural follow-up question or ends the interview based on transcript history.
 */
export async function getNextInterviewQuestionWithGemini(
  role: string,
  company: string,
  jobDescription: string,
  interviewType: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<InterviewTurnResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }

  try {
    const historyPrompt = history
      .map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`)
      .join('\n')

    const promptText = `
You are an expert ${interviewType} interviewer conducting a mock practice session.
Job Context:
- Company: ${company}
- Role: ${role}
- Job Description: ${jobDescription || "Not provided."}

Full Interview Transcript so far:
${historyPrompt || "No history yet. This is the start of the interview."}

Tasks:
1. If history is empty, introduce yourself briefly as the Avenor AI Interviewer, welcome the candidate to their ${interviewType} interview, and ask a relevant initial icebreaker question.
2. If the candidate just responded, evaluate their answer and ask exactly one natural, engaging follow-up question.
   - Alternately push them to expand on details or ask about specific tech/behavioral skills from the job description.
   - For TECHNICAL interviews, focus on coding standards, system design patterns, or technical experience.
   - For HR interviews, ask behavioral questions (e.g. teamwork, conflict resolution, prioritizing tasks).
   - For BOTH, blend them naturally.
   - Do not ask multiple questions in a single turn. Keep questions concise and focused.
3. If the interview has reached a natural conclusion (usually 5 to 6 questions) or the candidate expresses a desire to stop, set isEnded to true and output an empty question.

You must respond in strict JSON format matching this schema:
{
  "question": string,
  "isEnded": boolean
}
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errText}`)
    }

    const resJson = await response.json()
    const textContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsed = JSON.parse(textContent)

    return {
      question: parsed.question || 'Thank you for your response. Let us move to the next topic.',
      isEnded: !!parsed.isEnded,
    }
  } catch (error) {
    console.error('Failed to get next interview question:', error)
    return {
      question: 'Could you tell me more about your recent project achievements and technical stacks?',
      isEnded: false,
    }
  }
}

interface EvaluationResult {
  score: number
  decision: 'Hired' | 'Not Hired'
  strengths: string[]
  weaknesses: string[]
  tips: string[]
}

/**
 * Conducts a complete transcript audit of the mock interview to yield a detailed scorecard report.
 */
export async function evaluateMockInterviewWithGemini(
  role: string,
  company: string,
  interviewType: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<EvaluationResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }

  try {
    const historyText = history
      .map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`)
      .join('\n')

    const promptText = `
You are an elite talent acquisition leader and hiring bar-raiser. Evaluate this mock interview session.

Job Context:
- Company: ${company}
- Role: ${role}
- Interview Type: ${interviewType}

Complete Interview Transcript:
${historyText}

Tasks:
1. Grade the candidate performance out of 100. Consider communication clarity, technical correctness, structural completeness (e.g. STAR method), and role fit.
2. Determine if the candidate would be "Hired" or "Not Hired".
3. List 3 specific strengths they demonstrated during the call.
4. List 3 weaknesses or areas they lacked (e.g. too brief, missed metrics, lacked depth).
5. List 3 actionable tips for improvement.

You must respond in strict JSON format matching this schema:
{
  "score": number,
  "decision": "Hired" | "Not Hired",
  "strengths": [string],
  "weaknesses": [string],
  "tips": [string]
}
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errText}`)
    }

    const resJson = await response.json()
    const textContent = resJson.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsed = JSON.parse(textContent)

    return {
      score: Number(parsed.score) || 70,
      decision: parsed.decision === 'Hired' ? 'Hired' : 'Not Hired',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Good basic communication'],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ['Lacks project details'],
      tips: Array.isArray(parsed.tips) ? parsed.tips : ['Use the STAR method to structure answers'],
    }
  } catch (error) {
    console.error('Failed to evaluate mock interview:', error)
    return {
      score: 70,
      decision: 'Not Hired',
      strengths: ['Participated fully in the interview session'],
      weaknesses: ['Evaluation model encountered an api issue'],
      tips: ['Retake the interview to get detailed diagnostic breakdown'],
    }
  }
}

