# ADR-005: AI Provider Abstraction Layer

> **Document Owner:** Architecture Team / AI Team
> **Date:** 2026-07-13
> **Status:** Accepted
> **Deciders:** Lead Architect

---

## Context

Avenor's core differentiation is AI-powered features: resume analysis, cover letter generation, email classification, and career insights. These features require calling large language model APIs.

The LLM provider landscape is rapidly evolving:
- Pricing changes frequently
- New models are released constantly
- Different providers excel at different tasks
- A single provider going down could disable core features

We needed a design that avoids hard dependency on any single AI provider.

---

## Decision

**We will implement a provider abstraction layer that wraps all AI provider APIs behind a single interface. All AI calls in the application go through this interface, never directly to a provider SDK.**

---

## Rationale

1. **Provider flexibility** — Switch providers with a configuration change, not a code change
2. **Cost optimization** — Route different task types to the most cost-effective provider (e.g., Gemini Flash for classification, Claude Sonnet for cover letters)
3. **Fallback capability** — If one provider is down, route to another
4. **Testability** — Mock the abstraction interface in tests rather than mocking SDK internals
5. **Auditability** — Log all AI interactions through one centralized path
6. **Future-proofing** — New providers (Mistral, Llama, etc.) are additive, not architectural changes

---

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Direct SDK calls (OpenAI SDK, Anthropic SDK) | Hard couples codebase to provider; changing provider requires touching every AI call site |
| Vercel AI SDK | Adds another abstraction layer with its own API surface and update cycle; reduces control over provider configuration |
| LangChain | Extremely heavyweight; introduces significant complexity for features we don't need; the abstraction layer is straightforward enough to build ourselves |

---

## Consequences

### Positive
- Provider switching requires only config change
- All AI interactions logged and auditable
- Easy to add cost controls and rate limiting in one place
- Test isolation — mock one interface, not multiple SDKs

### Negative / Trade-offs
- Provider-specific features (e.g., function calling syntax differences, streaming formats) must be normalized in each provider implementation
- Initial engineering investment to build and maintain the abstraction
- Team must update provider implementations when provider APIs change

### Neutral
- Three provider implementations to maintain (OpenAI, Anthropic, Gemini)

---

## Interface Design

```typescript
// The core abstraction — lives in src/modules/ai/provider.ts
interface AIProvider {
  complete(request: AICompletionRequest): Promise<AICompletionResponse>
  stream(request: AICompletionRequest): AsyncIterable<AIStreamChunk>
}

interface AICompletionRequest {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  model?: string // Provider-specific model name; defaults from config
}

interface AICompletionResponse {
  content: string
  tokensUsed: { input: number; output: number }
  provider: AIProviderName
  model: string
  latencyMs: number
}
```

---

## Implementation Notes

- Provider implementations live in `src/modules/ai/providers/`
- Active provider is configured via `env.AI_PROVIDER` environment variable
- All AI requests and responses are logged to the `ai_requests` database table
- Prompts are managed as typed objects in `src/modules/ai/prompts/`
- AI output is always validated through a Zod schema before use

---

## Related Documents

- [`docs/ai/README.md`](../ai/README.md)
- [`docs/ai/provider-abstraction.md`](../ai/provider-abstraction.md)
- [`docs/ai/cost-management.md`](../ai/cost-management.md)
- [`docs/architecture/stack.md`](../architecture/stack.md)
