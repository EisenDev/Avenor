'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import {
  Sparkles, Mic, MicOff, PhoneOff, Play, Award,
  ArrowLeft, Loader2, CheckCircle2, XCircle, Volume2,
  History, ChevronDown, ChevronUp, Clock, BarChart3, X
} from 'lucide-react'
import Link from 'next/link'
import {
  getInterviewTurnAction,
  getInterviewEvaluationAction,
  getInterviewHistoryAction
} from '@/lib/actions/interview'

interface HistorySession {
  id: string
  interviewType: string
  score: number
  decision: string
  strengths: string[]
  weaknesses: string[]
  tips: string[]
  transcript: Array<{ role: 'user' | 'assistant'; content: string }>
  createdAt: Date
}

interface InterviewClientProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
  application: { id: string; company: string; role: string; notes?: string | null }
  interviewType: string
}

export function InterviewClient({ user, application, interviewType }: InterviewClientProps) {
  const [step, setStep] = useState<'LOBBY' | 'CALL' | 'REPORT'>('LOBBY')
  const [showStartModal, setShowStartModal] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  // Audio states
  const [isMuted, setIsMuted] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Interview state
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [userTranscript, setUserTranscript] = useState('')
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isProcessingTurn, setIsProcessingTurn] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(600)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null)

  // History tab
  const [showHistory, setShowHistory] = useState(false)
  const [pastSessions, setPastSessions] = useState<HistorySession[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  // Refs
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSpeechTimeRef = useRef<number>(Date.now())
  const safeguardTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number>(0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  // Load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const load = () => setAvailableVoices(window.speechSynthesis.getVoices())
      window.speechSynthesis.onvoiceschanged = load
      load()
    }
  }, [])

  // Mic audio stream
  useEffect(() => {
    if (step === 'CALL') {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(s => setStream(s))
        .catch(() => setVoiceError('Microphone access denied. Please allow microphone access.'))
    }
    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [step])

  // Mic level analyzer
  useEffect(() => {
    if (!stream || isMuted || step !== 'CALL') {
      setMicLevel(0)
      cancelAnimationFrame(animFrameRef.current)
      return
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioCtx()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)

      const tick = () => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = data[i] - 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / data.length)
        setMicLevel(Math.min(rms * 14, 100))
        animFrameRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch (e) {
      console.error('AudioContext error', e)
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
    }
  }, [stream, isMuted, step])

  // Speech recognition init
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setVoiceError('Speech recognition not supported in this browser. Use Chrome or Edge.'); return }

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (e: any) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      const text = final || interim
      if (text.trim()) {
        setUserTranscript(text)
        lastSpeechTimeRef.current = Date.now()
      }
    }
    rec.onsoundstart = () => { lastSpeechTimeRef.current = Date.now() }
    rec.onspeechstart = () => { lastSpeechTimeRef.current = Date.now() }
    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') setVoiceError('Microphone blocked. Please allow microphone permissions.')
      else if (e.error !== 'no-speech') setVoiceError(`Voice engine error: ${e.error}`)
    }
    recognitionRef.current = rec
  }, [])

  // Silence countdown auto-submit
  useEffect(() => {
    if (step !== 'CALL' || !hasStarted || isAiSpeaking || isProcessingTurn) {
      setSilenceCountdown(null); return
    }
    const iv = setInterval(() => {
      if (!userTranscript.trim()) { setSilenceCountdown(null); return }
      const elapsed = Date.now() - lastSpeechTimeRef.current
      const rem = Math.max(0, 10 - Math.floor(elapsed / 1000))
      setSilenceCountdown(rem)
      if (rem <= 0) handleSubmitAnswer()
    }, 500)
    return () => clearInterval(iv)
  }, [step, hasStarted, isAiSpeaking, isProcessingTurn, userTranscript])

  // Call countdown timer
  useEffect(() => {
    if (step !== 'CALL') return
    timerRef.current = setInterval(() => {
      setTimeRemaining(p => {
        if (p <= 1) { handleEndInterview(); return 0 }
        return p - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [step])

  const startSpeechRecognition = useCallback(() => {
    if (recognitionRef.current && !isMuted) {
      setUserTranscript('')
      try { recognitionRef.current.start() } catch (e) {}
    }
  }, [isMuted])

  const speakQuestion = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()
    if (safeguardTimerRef.current) clearTimeout(safeguardTimerRef.current)

    const utterance = new SpeechSynthesisUtterance(text)
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices()
    const voice =
      voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))) ||
      voices.find(v => v.lang.startsWith('en') && v.name.includes('Microsoft')) ||
      voices.find(v => v.lang.startsWith('en'))

    if (voice) utterance.voice = voice
    utterance.rate = 0.95
    utterance.pitch = 1.0

    const onEnd = () => {
      if (safeguardTimerRef.current) { clearTimeout(safeguardTimerRef.current); safeguardTimerRef.current = null }
      setIsAiSpeaking(false)
      lastSpeechTimeRef.current = Date.now()
      startSpeechRecognition()
    }

    utterance.onstart = () => {
      setIsAiSpeaking(true)
      setSilenceCountdown(null)
      try { recognitionRef.current?.stop() } catch (e) {}
    }
    utterance.onend = onEnd
    utterance.onerror = () => onEnd()

    const wordCount = text.split(/\s+/).length
    safeguardTimerRef.current = setTimeout(() => {
      window.speechSynthesis.cancel()
      onEnd()
    }, (wordCount / 140) * 60000 + 5000)

    window.speechSynthesis.speak(utterance)
  }, [availableVoices, startSpeechRecognition])

  const handleJoinRoom = () => {
    setStep('CALL')
    setShowStartModal(true)
  }

  const handleStartInterview = () => {
    setShowStartModal(false)
    setHasStarted(true)
    const welcome = `Hello! I'm Avenor, your AI interviewer. Welcome to your ${interviewType.toLowerCase()} interview for the ${application.role} role at ${application.company}. Let's begin — can you start by briefly walking me through your background and what drew you to apply for this role?`
    setCurrentQuestion(welcome)
    const init = [{ role: 'assistant' as const, content: welcome }]
    setHistory(init)
    speakQuestion(welcome)
  }

  const handleSubmitAnswer = async () => {
    if (isProcessingTurn) return
    setIsProcessingTurn(true)
    setSilenceCountdown(null)
    try { recognitionRef.current?.stop() } catch (e) {}

    const answer = userTranscript.trim() || 'Candidate finished speaking.'
    setUserTranscript('')

    const res = await getInterviewTurnAction(application.id, interviewType, history, answer)
    setIsProcessingTurn(false)

    if (res.success) {
      const { question, isEnded, history: updated } = res.data
      setHistory(updated)
      if (isEnded) { handleEndInterview(updated) }
      else { setCurrentQuestion(question); speakQuestion(question) }
    } else {
      setVoiceError(res.error)
    }
  }

  const handleEndInterview = async (finalHistory = history) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (safeguardTimerRef.current) clearTimeout(safeguardTimerRef.current)
    stream?.getTracks().forEach(t => t.stop())
    try { recognitionRef.current?.stop() } catch (e) {}
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()

    setStep('REPORT')
    setIsProcessingTurn(true)
    const res = await getInterviewEvaluationAction(application.id, interviewType, finalHistory)
    setIsProcessingTurn(false)
    if (res.success) setEvaluation(res.data)
    else setVoiceError(res.error)
  }

  const toggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    stream?.getAudioTracks().forEach(t => { t.enabled = !next })
    if (next) { try { recognitionRef.current?.stop() } catch (e) {} }
    else startSpeechRecognition()
  }

  const loadHistory = async () => {
    setLoadingHistory(true)
    const res = await getInterviewHistoryAction(application.id)
    setLoadingHistory(false)
    if (res.success) setPastSessions(res.data)
  }

  const fmt = (secs: number) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`

  // Waveform bars based on mic level
  const bars = [0.4, 0.7, 1.0, 0.7, 0.4, 0.6, 0.9, 0.6, 0.4, 0.8, 1.0, 0.8, 0.4]
  const isActive = micLevel > 12

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9f7f4', color: '#1a1a1a' }}>
      <Sidebar />

      <div style={{ marginLeft: 'var(--sidebar-width, 220px)', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div className="ai-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href={`/applications/${application.id}`} className="ai-back-btn">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <span className="ai-header-badge">Avenor AI Mock Call</span>
              <h1 className="ai-header-title">{application.company} — {application.role}</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step === 'CALL' && (
              <div className="ai-timer">
                <span className="blink-dot" />
                <span>{fmt(timeRemaining)}</span>
              </div>
            )}
            {step === 'LOBBY' && (
              <button
                className="ai-history-btn"
                onClick={() => { setShowHistory(h => !h); if (!showHistory) loadHistory() }}
              >
                <History size={16} />
                <span>History</span>
              </button>
            )}
          </div>
        </div>

        <main className="ai-main">

          {/* ── LOBBY ── */}
          {step === 'LOBBY' && !showHistory && (
            <div className="ai-lobby-card animate-slide-up">
              <div className="ai-lobby-inner">
                <div className="ai-lobby-left">
                  <div className="ai-avatar-large">
                    <span style={{ fontSize: 48 }}>🤖</span>
                  </div>
                  <div className="ai-avatar-info">
                    <div className="ai-badge-tag">
                      <Sparkles size={12} />
                      <span>AI Interviewer Ready</span>
                    </div>
                    <div className="ai-avatar-name">Avenor AI</div>
                    <div className="ai-avatar-sub">Powered by Gemini</div>
                  </div>
                </div>

                <div className="ai-lobby-right">
                  <div className="ai-badge-tag" style={{ marginBottom: 8 }}>
                    <Sparkles size={12} />
                    <span>Ready to join?</span>
                  </div>
                  <h2 className="ai-lobby-title">Join AI Interview</h2>
                  <p className="ai-lobby-desc">
                    Practice live voice-based interview questions tailored to your job posting with Avenor's AI interviewer.
                  </p>

                  <div className="ai-session-details">
                    <div className="ai-detail-row">
                      <span>Session Type</span>
                      <strong>{interviewType} Interview</strong>
                    </div>
                    <div className="ai-detail-row">
                      <span>Max Duration</span>
                      <strong>10 Minutes</strong>
                    </div>
                    <div className="ai-detail-row">
                      <span>Interviewer</span>
                      <strong>Avenor AI Engine</strong>
                    </div>
                  </div>

                  <button className="ai-join-btn" onClick={handleJoinRoom}>
                    <Play size={15} fill="white" />
                    <span>Join Room</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORY ── */}
          {step === 'LOBBY' && showHistory && (
            <div className="ai-content-card animate-slide-up" style={{ maxWidth: 760, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <div className="ai-badge-tag" style={{ marginBottom: 6 }}>
                    <History size={12} />
                    <span>Past Sessions</span>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#1a1a1a' }}>AI Interview History</h2>
                </div>
                <button className="ai-history-btn" onClick={() => setShowHistory(false)}>
                  <X size={16} />
                  <span>Close</span>
                </button>
              </div>

              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b6b6b' }}>
                  <Loader2 size={28} className="animate-spin" style={{ marginBottom: 12, color: 'var(--color-primary)' }} />
                  <p style={{ margin: 0, fontSize: 14 }}>Loading sessions...</p>
                </div>
              ) : pastSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b6b6b' }}>
                  <BarChart3 size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>No past interview sessions yet.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#9a9a9a' }}>Complete your first mock interview to see results here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pastSessions.map(s => (
                    <div key={s.id} className="ai-history-item">
                      <div className="ai-history-item-header" onClick={() => setExpandedSession(e => e === s.id ? null : s.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className={`ai-score-badge ${s.score >= 70 ? 'good' : s.score >= 50 ? 'mid' : 'low'}`}>
                            {s.score}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{s.interviewType} Interview</div>
                            <div style={{ fontSize: 12, color: '#6b6b6b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <Clock size={11} />
                              {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className={`ai-decision-badge ${s.decision === 'Hired' ? 'hired' : 'not-hired'}`}>
                            {s.decision === 'Hired' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                            {s.decision}
                          </span>
                          {expandedSession === s.id ? <ChevronUp size={16} color="#6b6b6b" /> : <ChevronDown size={16} color="#6b6b6b" />}
                        </div>
                      </div>

                      {expandedSession === s.id && (
                        <div className="ai-history-expanded">
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#2e7d32', marginBottom: 6 }}>✓ Strengths</div>
                              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#4a4a4a', lineHeight: 1.6 }}>
                                {s.strengths.map((str, i) => <li key={i}>{str}</li>)}
                              </ul>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#c62828', marginBottom: 6 }}>✗ Areas to Improve</div>
                              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#4a4a4a', lineHeight: 1.6 }}>
                                {s.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                              </ul>
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 6 }}>💡 Coaching Tips</div>
                            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#4a4a4a', lineHeight: 1.6 }}>
                              {s.tips.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── START MODAL ── */}
          {showStartModal && (
            <div className="ai-modal-backdrop">
              <div className="ai-modal animate-slide-up">
                <div className="ai-modal-icon">
                  <Volume2 size={32} color="var(--color-primary)" />
                </div>
                <h2 className="ai-modal-title">Start Your AI Voice Call</h2>
                <p className="ai-modal-desc">
                  Click "Start Interview" to initialize the voice engine. The AI interviewer will introduce themselves and voice the first question.
                </p>
                <div className="ai-modal-tips">
                  <span>🎙️ Speak naturally — the AI listens for 10 seconds of silence before responding</span>
                </div>
                <button className="ai-join-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleStartInterview}>
                  <Play size={15} fill="white" />
                  <span>Start Interview</span>
                </button>
              </div>
            </div>
          )}

          {/* ── CALL ── */}
          {step === 'CALL' && !showStartModal && (
            <div className="ai-call-wrapper">

              {voiceError && (
                <div className="ai-error-banner">
                  <span>⚠️ {voiceError}</span>
                </div>
              )}

              {/* Two tiles */}
              <div className="ai-call-grid">

                {/* AI Tile */}
                <div className={`ai-call-tile ai-interviewer-tile ${isAiSpeaking ? 'speaking' : ''}`}>
                  <div className={`ai-avatar-ring ${isAiSpeaking ? 'pulsing' : ''}`}>
                    <span style={{ fontSize: 36 }}>🤖</span>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Avenor AI Interviewer</div>
                    <div className={`ai-status-tag ${isAiSpeaking ? 'active' : ''}`}>
                      {isProcessingTurn ? 'Thinking...' : isAiSpeaking ? 'Speaking...' : 'Listening...'}
                    </div>
                  </div>

                  {/* Question subtitle */}
                  {currentQuestion && (
                    <div className="ai-subtitle-card">
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#2a2a2a' }}>{currentQuestion}</p>
                      <button className="ai-replay-btn" onClick={() => speakQuestion(currentQuestion)} title="Replay question">
                        <Volume2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* User Tile */}
                <div className="ai-call-tile ai-user-tile">
                  {/* Mic waveform visualizer */}
                  <div className="ai-waveform-container">
                    {bars.map((scale, i) => {
                      const h = isActive
                        ? Math.max(4, scale * (micLevel / 100) * 40)
                        : 4
                      return (
                        <div
                          key={i}
                          className={`ai-wave-bar ${isActive ? 'active' : ''}`}
                          style={{ height: h }}
                        />
                      )
                    })}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                    <div className={`ai-mic-dot ${isMuted ? 'muted' : isActive ? 'active' : ''}`} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4a4a' }}>
                      {isMuted ? 'Mic Off' : isActive ? 'Mic Active' : 'Mic Idle'}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#6b6b6b', marginTop: 4 }}>{user.name || 'You'}</div>

                  {/* Live transcript */}
                  {userTranscript && (
                    <div className="ai-transcript-pill">
                      <p style={{ margin: 0, fontSize: 12, color: '#2a2a2a', fontStyle: 'italic' }}>
                        "{userTranscript}"
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Silence countdown */}
              {silenceCountdown !== null && silenceCountdown > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div className="ai-countdown-pill">
                    Submitting answer in {silenceCountdown}s...
                  </div>
                </div>
              )}

              {/* Toolbar */}
              <div className="ai-toolbar">
                <button className={`ai-tool-btn ${isMuted ? 'danger' : ''}`} onClick={toggleMute}>
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  {!isAiSpeaking && hasStarted && (
                    <button className="ai-done-btn" onClick={handleSubmitAnswer} disabled={isProcessingTurn}>
                      {isProcessingTurn
                        ? <Loader2 size={13} className="animate-spin" />
                        : <span>Done Answering</span>}
                    </button>
                  )}
                  <button className="ai-hangup-btn" onClick={() => handleEndInterview()}>
                    <PhoneOff size={15} />
                    <span>End Interview</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ── REPORT ── */}
          {step === 'REPORT' && (
            <div className="ai-report-wrapper animate-slide-up">

              {isProcessingTurn || !evaluation ? (
                <div className="ai-content-card" style={{ textAlign: 'center', padding: '64px 32px' }}>
                  <Loader2 size={40} className="animate-spin" color="var(--color-primary)" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: '#1a1a1a' }}>Compiling Scorecard...</h3>
                  <p style={{ fontSize: 13, color: '#6b6b6b', margin: 0 }}>
                    Gemini AI is analyzing your responses, vocabulary, and structural quality.
                  </p>
                </div>
              ) : (
                <>
                  {/* Score Header */}
                  <div className="ai-score-header">
                    <div style={{ flex: 1 }}>
                      <div className="ai-badge-tag" style={{ marginBottom: 8 }}>
                        <Award size={12} />
                        <span>AI Evaluation Completed</span>
                      </div>
                      <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px 0', color: '#1a1a1a' }}>
                        Mock Interview Scorecard
                      </h2>
                      <p style={{ fontSize: 13, color: '#6b6b6b', margin: 0 }}>
                        Audited outcomes based on structural and communication quality.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span className={`ai-decision-badge large ${evaluation.decision === 'Hired' ? 'hired' : 'not-hired'}`}>
                        {evaluation.decision === 'Hired' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {evaluation.decision.toUpperCase()}
                      </span>
                      <div className={`ai-score-circle ${evaluation.score >= 70 ? 'good' : evaluation.score >= 50 ? 'mid' : 'low'}`}>
                        <span className="ai-score-number">{evaluation.score}</span>
                        <span className="ai-score-label">/ 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback grid */}
                  <div className="ai-feedback-grid">
                    <div className="ai-feedback-card strengths">
                      <h3>✓ Key Strengths</h3>
                      <ul>
                        {evaluation.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="ai-feedback-card weaknesses">
                      <h3>✗ Areas to Improve</h3>
                      <ul>
                        {evaluation.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="ai-tips-card">
                    <h3>💡 Actionable Coaching Tips</h3>
                    <ul>
                      {evaluation.tips.map((t: string, i: number) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                    <Link href={`/applications/${application.id}/ai-interview?type=${interviewType}`} style={{ textDecoration: 'none' }}>
                      <button className="ai-secondary-btn">Try Again</button>
                    </Link>
                    <Link href={`/applications/${application.id}`} style={{ textDecoration: 'none' }}>
                      <button className="ai-primary-btn">Back to Application</button>
                    </Link>
                  </div>
                </>
              )}

            </div>
          )}

        </main>
      </div>

      <style>{`
        /* ── Layout ── */
        .ai-header {
          background: #fff;
          border-bottom: 1px solid #e8e3dc;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .ai-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #f5f0ea;
          color: #5a5a5a;
          text-decoration: none;
          transition: background 0.15s;
        }
        .ai-back-btn:hover { background: #ede8e0; }
        .ai-header-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--color-primary);
        }
        .ai-header-title {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 2px 0 0 0;
        }
        .ai-timer {
          background: rgba(180, 83, 50, 0.1);
          color: var(--color-primary);
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-history-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #e0d9d0;
          background: #fff;
          color: #4a4a4a;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ai-history-btn:hover { background: #f5f0ea; }

        .ai-main {
          flex: 1;
          padding: 32px 24px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        /* ── Badge ── */
        .ai-badge-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(180, 83, 50, 0.08);
          color: var(--color-primary);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 3px 8px;
          border-radius: 99px;
        }

        /* ── Lobby ── */
        .ai-lobby-card {
          background: #fff;
          border: 1px solid #e8e3dc;
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 800px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
        }
        .ai-lobby-inner {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
          align-items: center;
        }
        .ai-lobby-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .ai-avatar-large {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(180, 83, 50, 0.08), rgba(180, 83, 50, 0.18));
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(180, 83, 50, 0.2);
        }
        .ai-avatar-info {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .ai-avatar-name {
          font-size: 18px;
          font-weight: 800;
          color: #1a1a1a;
        }
        .ai-avatar-sub {
          font-size: 12px;
          color: #8a8a8a;
        }
        .ai-lobby-right {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .ai-lobby-title {
          font-size: 24px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 8px 0 6px 0;
        }
        .ai-lobby-desc {
          font-size: 13px;
          color: #6b6b6b;
          margin: 0;
          line-height: 1.6;
        }
        .ai-session-details {
          margin: 20px 0;
          border-top: 1px solid #ede8e0;
          border-bottom: 1px solid #ede8e0;
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ai-detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        .ai-detail-row span { color: #6b6b6b; }
        .ai-detail-row strong { color: #1a1a1a; font-weight: 600; }

        .ai-join-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 10px;
          height: 44px;
          padding: 0 24px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ai-join-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        /* ── Modal ── */
        .ai-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .ai-modal {
          background: #fff;
          border-radius: 20px;
          padding: 48px 40px;
          max-width: 480px;
          width: 100%;
          text-align: center;
          box-shadow: 0 16px 64px rgba(0,0,0,0.15);
        }
        .ai-modal-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(180, 83, 50, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
        }
        .ai-modal-title {
          font-size: 22px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 10px 0;
        }
        .ai-modal-desc {
          font-size: 14px;
          color: #6b6b6b;
          margin: 0 0 16px 0;
          line-height: 1.6;
        }
        .ai-modal-tips {
          background: #f9f7f4;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 12px;
          color: #6b6b6b;
          margin-bottom: 24px;
        }

        /* ── Call ── */
        .ai-call-wrapper {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ai-error-banner {
          background: rgba(180, 83, 50, 0.08);
          border: 1px solid rgba(180, 83, 50, 0.3);
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          color: var(--color-primary);
        }
        .ai-call-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ai-call-tile {
          background: #fff;
          border: 1.5px solid #e8e3dc;
          border-radius: 16px;
          min-height: 260px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          transition: border-color 0.3s;
        }
        .ai-interviewer-tile.speaking {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(180, 83, 50, 0.1);
        }
        .ai-avatar-ring {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(180,83,50,0.08), rgba(180,83,50,0.2));
          border: 2.5px solid #e8e3dc;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .ai-avatar-ring.pulsing {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 6px rgba(180, 83, 50, 0.12), 0 0 0 12px rgba(180, 83, 50, 0.06);
          animation: ai-pulse 1.5s infinite;
        }
        @keyframes ai-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .ai-status-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #8a8a8a;
          margin-top: 4px;
          transition: color 0.2s;
        }
        .ai-status-tag.active { color: var(--color-primary); }

        .ai-subtitle-card {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border: 1px solid #ede8e0;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .ai-replay-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid #e0d9d0;
          background: #f5f0ea;
          color: #5a5a5a;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ai-replay-btn:hover { background: rgba(180,83,50,0.1); color: var(--color-primary); }

        /* Mic waveform */
        .ai-waveform-container {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 48px;
        }
        .ai-wave-bar {
          width: 4px;
          background: #d0c9bf;
          border-radius: 99px;
          transition: height 0.07s ease, background 0.2s;
          min-height: 4px;
        }
        .ai-wave-bar.active {
          background: var(--color-primary);
        }

        .ai-mic-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d0c9bf;
          transition: background 0.2s;
        }
        .ai-mic-dot.active { background: #34c759; }
        .ai-mic-dot.muted { background: #ff3b30; }

        .ai-transcript-pill {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          background: rgba(255,255,255,0.95);
          border: 1px solid #ede8e0;
          border-radius: 10px;
          padding: 8px 12px;
          max-height: 72px;
          overflow: hidden;
        }

        .ai-countdown-pill {
          display: inline-block;
          background: rgba(180, 83, 50, 0.1);
          color: var(--color-primary);
          border: 1px solid rgba(180, 83, 50, 0.3);
          border-radius: 99px;
          padding: 5px 16px;
          font-size: 12px;
          font-weight: 700;
          animation: ai-blink 1s infinite alternate;
        }

        /* Toolbar */
        .ai-toolbar {
          background: #fff;
          border: 1px solid #e8e3dc;
          border-radius: 14px;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .ai-tool-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid #e8e3dc;
          background: #f9f7f4;
          color: #4a4a4a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ai-tool-btn:hover { background: #ede8e0; }
        .ai-tool-btn.danger { background: #ff3b30; border-color: #ff3b30; color: white; }
        .ai-done-btn {
          height: 40px;
          padding: 0 18px;
          border-radius: 10px;
          background: #34c759;
          color: white;
          border: none;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.15s;
        }
        .ai-done-btn:hover { opacity: 0.9; }
        .ai-done-btn:disabled { opacity: 0.5; cursor: default; }
        .ai-hangup-btn {
          height: 40px;
          padding: 0 18px;
          border-radius: 10px;
          background: #ff3b30;
          color: white;
          border: none;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.15s;
        }
        .ai-hangup-btn:hover { opacity: 0.9; }

        /* ── Report ── */
        .ai-report-wrapper {
          width: 100%;
          max-width: 820px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ai-score-header {
          background: #fff;
          border: 1px solid #e8e3dc;
          border-radius: 16px;
          padding: 28px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .ai-score-circle {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 3px solid;
          flex-shrink: 0;
        }
        .ai-score-circle.good { border-color: #34c759; background: rgba(52,199,89,0.06); }
        .ai-score-circle.mid { border-color: #ff9f0a; background: rgba(255,159,10,0.06); }
        .ai-score-circle.low { border-color: #ff3b30; background: rgba(255,59,48,0.06); }
        .ai-score-number {
          font-size: 28px;
          font-weight: 900;
          color: #1a1a1a;
          line-height: 1;
        }
        .ai-score-label { font-size: 10px; color: #8a8a8a; }

        .ai-decision-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 99px;
        }
        .ai-decision-badge.hired { background: rgba(52,199,89,0.1); color: #2e7d32; }
        .ai-decision-badge.not-hired { background: rgba(255,59,48,0.1); color: #c62828; }
        .ai-decision-badge.large { font-size: 13px; padding: 6px 14px; }

        .ai-feedback-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ai-feedback-card {
          background: #fff;
          border: 1px solid #e8e3dc;
          border-radius: 14px;
          padding: 20px;
        }
        .ai-feedback-card h3 {
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }
        .ai-feedback-card.strengths h3 { color: #2e7d32; }
        .ai-feedback-card.weaknesses h3 { color: #c62828; }
        .ai-feedback-card ul {
          padding-left: 16px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
          color: #4a4a4a;
          line-height: 1.5;
        }
        .ai-tips-card {
          background: #fff;
          border: 1px solid #e8e3dc;
          border-radius: 14px;
          padding: 20px;
        }
        .ai-tips-card h3 {
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: var(--color-primary);
        }
        .ai-tips-card ul {
          padding-left: 16px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
          color: #4a4a4a;
          line-height: 1.5;
        }
        .ai-primary-btn {
          height: 40px;
          padding: 0 20px;
          border-radius: 10px;
          background: var(--color-primary);
          color: white;
          border: none;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .ai-primary-btn:hover { opacity: 0.9; }
        .ai-secondary-btn {
          height: 40px;
          padding: 0 20px;
          border-radius: 10px;
          background: #f5f0ea;
          color: #4a4a4a;
          border: 1px solid #e0d9d0;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .ai-secondary-btn:hover { background: #ede8e0; }

        /* ── History ── */
        .ai-content-card {
          background: #fff;
          border: 1px solid #e8e3dc;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
        }
        .ai-history-item {
          background: #fff;
          border: 1px solid #e8e3dc;
          border-radius: 12px;
          overflow: hidden;
        }
        .ai-history-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ai-history-item-header:hover { background: #f9f7f4; }
        .ai-history-expanded {
          border-top: 1px solid #e8e3dc;
          padding: 16px;
          background: #f9f7f4;
        }
        .ai-score-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
        }
        .ai-score-badge.good { background: rgba(52,199,89,0.1); color: #2e7d32; }
        .ai-score-badge.mid { background: rgba(255,159,10,0.1); color: #e65100; }
        .ai-score-badge.low { background: rgba(255,59,48,0.1); color: #c62828; }

        /* ── Animations ── */
        .animate-slide-up {
          animation: slideUp 0.3s ease both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .blink-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-primary);
          animation: ai-blink 1s infinite alternate;
        }
        @keyframes ai-blink {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ai-main { padding: 16px; }
          .ai-lobby-card { padding: 24px; }
          .ai-lobby-inner { grid-template-columns: 1fr; gap: 24px; }
          .ai-lobby-left { flex-direction: row; align-items: center; gap: 16px; }
          .ai-avatar-large { width: 72px; height: 72px; flex-shrink: 0; }
          .ai-avatar-info { text-align: left; align-items: flex-start; }
          .ai-call-grid { grid-template-columns: 1fr; }
          .ai-call-tile { min-height: 200px; }
          .ai-feedback-grid { grid-template-columns: 1fr; }
          .ai-score-header { flex-direction: column; align-items: flex-start; }
          .ai-modal { padding: 32px 24px; }
        }
        @media (max-width: 480px) {
          .ai-toolbar { flex-direction: column; align-items: stretch; }
          .ai-toolbar > div { display: flex; gap: 10px; justify-content: center; }
        }
      `}</style>
    </div>
  )
}
