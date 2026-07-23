# AI Provider Abstraction

> **Document Owner:** AI Team
> **Last Updated:** 2026-07-13
> **Status:** Active — Source of Truth

See also: [ADR-005](../decisions/ADR-005-ai-abstraction.md) — the decision that established this design.

---

## Interface Definition

The core abstraction lives in `src/modules/ai/provider.ts`:

```ts
export type AIProviderName = 'openai' | 'anthropic' | 'gemini'

export interface AICompletionRequest {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  model?: string          // If omitted, uses the provider's configured default model
  operation?: string      // Descriptive label for logging (e.g., 'resume_analysis')
}

export interface AICompletionResponse {
  content: string
  provider: AIProviderName
  model: string
  tokensUsed: {
    input: number
    output: number
    total: number
  }
  latencyMs: number
}

export interface AIStreamChunk {
  delta: string
  done: boolean
}

export interface AIProvider {
  complete(request: AICompletionRequest): Promise<AICompletionResponse>
  stream(request: AICompletionRequest): AsyncIterable<AIStreamChunk>
  getProviderName(): AIProviderName
}
```

---

## Provider Implementations

### OpenAI Provider

```
File: src/modules/ai/providers/openai.ts
Default model: gpt-4o-mini (configurable via AI_OPENAI_DEFAULT_MODEL)
Used for: Cover letter generation, general text tasks
```

### Anthropic Provider

```
File: src/modules/ai/providers/anthropic.ts
Default model: claude-3-5-haiku-20241022 (configurable via AI_ANTHROPIC_DEFAULT_MODEL)
Used for: Long-context document analysis, complex reasoning
```

### Gemini Provider

```
File: src/modules/ai/providers/gemini.ts
Default model: gemini-1.5-flash (configurable via AI_GEMINI_DEFAULT_MODEL)
Used for: Email classification, fast/cheap batch operations
```

---

## Provider Selection

The active provider is selected from the environment:

```env
# .env.local
AI_PROVIDER=openai              # Which provider to use by default
AI_OPENAI_API_KEY=sk-...
AI_ANTHROPIC_API_KEY=sk-ant-...
AI_GEMINI_API_KEY=AIza...
```

The factory function in `src/modules/ai/index.ts`:

```ts
export function createAIProvider(): AIProvider {
  switch (env.AI_PROVIDER) {
    case 'openai':    return new OpenAIProvider()
    case 'anthropic': return new AnthropicProvider()
    case 'gemini':    return new GeminiProvider()
    default:
      throw new Error(`Unknown AI provider: ${env.AI_PROVIDER}`)
  }
}

// Singleton used throughout the application
export const aiProvider = createAIProvider()
```

---

## Operation-Specific Provider Routing

For cost optimization, different operations can be routed to different providers:

```ts
// Future enhancement — operation-specific provider config
// AI_PROVIDER_EMAIL_CLASSIFICATION=gemini   (fast, cheap for high volume)
// AI_PROVIDER_COVER_LETTER=anthropic        (high quality for important output)
// AI_PROVIDER_DEFAULT=openai               (fallback)
```

This is not implemented in v1 but the architecture supports it.

---

## Error Handling

All AI provider errors are caught and converted to typed application errors:

```ts
export class AIProviderError extends AppError {
  constructor(provider: AIProviderName, message: string) {
    super(
      `AI provider "${provider}" error: ${message}`,
      'AI_PROVIDER_ERROR',
      502,  // Bad Gateway — upstream failure
    )
  }
}

export class AIRateLimitError extends AppError {
  constructor(provider: AIProviderName, retryAfter?: number) {
    super(
      `AI provider "${provider}" rate limit exceeded`,
      'AI_RATE_LIMIT',
      429,
      { retryAfter },
    )
  }
}

export class AIOutputValidationError extends AppError {
  constructor(operation: string) {
    super(
      `AI output for "${operation}" failed schema validation`,
      'AI_OUTPUT_INVALID',
      500,
    )
  }
}
```

---

## Retry Strategy

AI requests are retried with exponential backoff:

| Attempt | Delay | Condition |
|---|---|---|
| 1 | immediate | Any transient error |
| 2 | 1 second | Still failing |
| 3 | 4 seconds | Still failing |
| 4 | — | Throw `AIProviderError` |

Rate limit errors (`429`) wait for `retryAfter` seconds before retrying.

Timeout errors retry immediately (no delay) up to 3 times.

---

## Testing AI Features

AI providers are mocked in tests. The mock implementation satisfies the `AIProvider` interface:

```ts
// src/modules/ai/__tests__/mock-provider.ts
export class MockAIProvider implements AIProvider {
  constructor(private responses: Map<string, string> = new Map()) {}

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const content = this.responses.get(request.operation ?? 'default') ?? '{}'
    return {
      content,
      provider: 'openai',
      model: 'gpt-4o-mini',
      tokensUsed: { input: 100, output: 200, total: 300 },
      latencyMs: 50,
    }
  }

  async *stream() { yield { delta: '', done: true } }
  getProviderName() { return 'openai' as const }
}
```

Never make real AI API calls in tests. The mock covers all test scenarios.
