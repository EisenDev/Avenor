# AI Integration

> **Document Owner:** AI Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

---

## Overview

Avenor's AI capabilities are built on a **provider abstraction layer** that wraps multiple LLM providers behind a single interface. No business code calls OpenAI, Anthropic, or Google AI SDKs directly — all AI calls go through `src/modules/ai/provider.ts`.

---

## Required Reading

| Topic | Document |
|---|---|
| Provider abstraction design | [`provider-abstraction.md`](./provider-abstraction.md) |
| Prompt engineering guide | [`prompt-engineering.md`](./prompt-engineering.md) |
| Cost management | [`cost-management.md`](./cost-management.md) |
| AI safety | [`safety.md`](./safety.md) |

---

## AI Features in Avenor

| Feature | Module | Description |
|---|---|---|
| Resume Analysis | `documents` → `ai` | Analyze a resume for ATS compatibility and improvements |
| Cover Letter Generation | `documents` → `ai` | Generate a tailored cover letter for a specific job |
| Email Classification | `emails` → `ai` | Classify incoming emails as job-related (offer, rejection, interview invite) |
| Career Insights | `analytics` → `ai` | Generate personalized career insights from application data |
| Interview Prep | `interviews` → `ai` | Generate likely interview questions based on role and company |

---

## Provider Abstraction Architecture

```
Business code (service.ts in any module)
         │
         ▼
  AIProvider interface
  (src/modules/ai/provider.ts)
         │
         ├──► OpenAIProvider (src/modules/ai/providers/openai.ts)
         ├──► AnthropicProvider (src/modules/ai/providers/anthropic.ts)
         └──► GeminiProvider (src/modules/ai/providers/gemini.ts)
```

The active provider is selected at runtime from `env.AI_PROVIDER`. All three providers implement the same interface — switching requires only a config change.

---

## Calling AI From a Service

```ts
// src/modules/documents/service.ts
import { aiProvider } from '@/modules/ai'
import { resumeAnalysisPrompt } from '@/modules/ai/prompts/resume-analysis'
import { ResumeAnalysisOutputSchema } from '@/modules/ai/schemas'

export async function analyzeResume(
  documentId: string,
  userId: string,
): Promise<ResumeAnalysisResult> {
  const document = await documentRepository.findById(documentId)
  if (!document) throw new DocumentNotFoundError(documentId)

  const rawOutput = await aiProvider.complete({
    systemPrompt: resumeAnalysisPrompt.system,
    prompt: resumeAnalysisPrompt.user(document.content),
    maxTokens: 2000,
    temperature: 0.3,  // Lower temperature for structured analysis
  })

  // Always validate AI output with Zod before using it
  const analysis = ResumeAnalysisOutputSchema.parse(JSON.parse(rawOutput.content))

  logger.info('Resume analysis completed', {
    documentId,
    userId,
    tokensUsed: rawOutput.tokensUsed,
    provider: rawOutput.provider,
  })

  return analysis
}
```

---

## Prompt Management

All prompts are typed objects in `src/modules/ai/prompts/`. Each prompt file exports:
- A `system` string — the system prompt
- A `user()` function — a template function that takes input and returns the user prompt
- An output schema — the Zod schema for validating the AI's response

```ts
// src/modules/ai/prompts/resume-analysis.ts
export const resumeAnalysisPrompt = {
  system: `You are an expert career coach and ATS specialist. Analyze resumes for
           ATS compatibility, keyword optimization, and clarity. Always respond
           with valid JSON matching the specified schema.`,

  user: (resumeContent: string) => `
    Analyze the following resume and provide structured feedback:

    <resume>
    ${resumeContent}
    </resume>

    Respond with JSON only. No markdown, no explanation outside JSON.
  `,
}
```

Full prompt engineering guide → [`prompt-engineering.md`](./prompt-engineering.md)

---

## AI Logging Requirements

Every AI request and response is logged to the `ai_requests` database table:

| Field | Description |
|---|---|
| `userId` | Who made the request |
| `provider` | Which provider was used |
| `model` | Which model was used |
| `operation` | What feature triggered this (`resume_analysis`, `cover_letter`, etc.) |
| `promptTokens` | Input token count |
| `completionTokens` | Output token count |
| `latencyMs` | Time to first token / time to completion |
| `cost` | Estimated cost in USD |
| `error` | Error message if the request failed |

This data is used for:
- Cost tracking and budgeting
- Performance monitoring
- Debugging failed AI features
- User-facing usage analytics

---

## AI Output Validation

AI output is **never** used without validation. Every AI operation has a Zod output schema:

```ts
// ✅ Always parse AI output
const result = OutputSchema.parse(JSON.parse(rawOutput.content))

// ❌ Never use raw AI output directly
const result = JSON.parse(rawOutput.content) as MyType  // No runtime validation
```

If validation fails, log the raw output and throw an `AIOutputValidationError`. Do not crash the request — return a graceful error state to the user.

---

## Team Ownership

| Area | Owner |
|---|---|
| Provider abstraction layer | AI Team |
| Prompt library | AI Team |
| Feature integration (calling AI from domain modules) | Domain module owner |
| Cost monitoring | AI Team + Infrastructure |
| Output schema validation | AI Team |
