'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import { Sparkles, Video, VideoOff, Mic, MicOff, Type, PhoneOff, Play, ShieldAlert, Award, ArrowLeft, Loader2, CheckCircle2, XCircle, Volume2 } from 'lucide-react'
import Link from 'next/link'
import { getInterviewTurnAction, getInterviewEvaluationAction } from '@/lib/actions/interview'

interface InterviewClientProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  application: {
    id: string
    company: string
    role: string
    notes?: string | null
  }
  interviewType: string
}

export function InterviewClient({ user, application, interviewType }: InterviewClientProps) {
  const [step, setStep] = useState<'LOBBY' | 'CALL' | 'REPORT'>('LOBBY')
  const [hasStarted, setHasStarted] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Video call stream states
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCamOff, setIsCamOff] = useState(false)
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true)

  // Real-time Mic Level state
  const [micLevel, setMicLevel] = useState(0) // Ranges 0 to 100

  // Webcam video elements
  const lobbyVideoRef = useRef<HTMLVideoElement>(null)
  const callVideoRef = useRef<HTMLVideoElement>(null)

  // Interview state variables
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [userTranscript, setUserTranscript] = useState('')
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [isProcessingTurn, setIsProcessingTurn] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes count
  const [evaluation, setEvaluation] = useState<any>(null)
  const [typedAnswerFallback, setTypedAnswerFallback] = useState('')
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [voiceEngineError, setVoiceEngineError] = useState<string | null>(null)

  // Silence threshold countdown state (visual confirmation for user)
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null)

  // Speech Recognition reference
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSpeechTimeRef = useRef<number>(Date.now())
  const safeguardTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Web Speech Synthesis voices list
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  // Setup Web Speech Synthesis Voice Loader
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        setAvailableVoices(window.speechSynthesis.getVoices())
      }
      window.speechSynthesis.onvoiceschanged = loadVoices
      loadVoices()
    }
  }, [])

  // Initialize Web Camera Stream in Lobby
  useEffect(() => {
    async function startCamera() {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        })
        setStream(localStream)
      } catch (err) {
        console.error('Webcam access denied:', err)
      }
    }
    if (step === 'LOBBY') {
      startCamera()
    }
  }, [step])

  // Bind video element to stream depending on lobby/call steps
  useEffect(() => {
    if (step === 'LOBBY' && lobbyVideoRef.current && stream) {
      lobbyVideoRef.current.srcObject = stream
    } else if (step === 'CALL' && callVideoRef.current && stream) {
      callVideoRef.current.srcObject = stream
    }
  }, [step, stream, isCamOff])

  // Real-time Mic Level Analyzer using Web Audio API (Time-Domain RMS calculation)
  useEffect(() => {
    if (!stream || isMuted || step !== 'CALL') {
      setMicLevel(0)
      return
    }

    let audioContext: AudioContext | null = null
    let animationFrameId: number

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      audioContext = new AudioCtx()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const checkVolume = () => {
        analyser.getByteTimeDomainData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          // Time-domain amplitude ranges from 0 to 255. Center is 128.
          const value = dataArray[i] - 128
          sum += value * value
        }
        // Root Mean Square (RMS) represents physical amplitude/intensity
        const rms = Math.sqrt(sum / bufferLength)
        // Scale and cap the level
        setMicLevel(Math.min(rms * 12, 100))
        animationFrameId = requestAnimationFrame(checkVolume)
      }

      checkVolume()
    } catch (e) {
      console.error('Web Audio API analyzer failed to start:', e)
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close()
      }
    }
  }, [stream, isMuted, step])

  // Initialize Web Speech Recognition with native silence/sound hooks
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSpeechSupported(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (e: any) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript
        } else {
          interim += e.results[i][0].transcript
        }
      }
      const text = final || interim
      if (text.trim() !== '') {
        setUserTranscript(text)
        lastSpeechTimeRef.current = Date.now() // Reset silence timer on vocal transcription
      }
    }

    // Voice Activity Detection (VAD) callback hooks
    rec.onsoundstart = () => {
      lastSpeechTimeRef.current = Date.now()
    }
    rec.onspeechstart = () => {
      lastSpeechTimeRef.current = Date.now()
    }
    rec.onspeechend = () => {
      lastSpeechTimeRef.current = Date.now()
    }

    rec.onstart = () => {
      setIsUserSpeaking(true)
      lastSpeechTimeRef.current = Date.now()
    }

    rec.onerror = (err: any) => {
      console.error('Speech recognition error:', err)
      if (err.error === 'not-allowed') {
        setVoiceEngineError("Microphone access is blocked. Please check your browser microphone permissions.")
      } else if (err.error === 'network') {
        setVoiceEngineError("Speech Recognition network connection failed (Brave Shields or VM privacy settings may be blocking the Speech-to-Text API).")
      } else {
        setVoiceEngineError(`Speech Recognition error: ${err.error || 'Unknown error'}`)
      }
    }

    rec.onend = () => {
      setIsUserSpeaking(false)
    }

    recognitionRef.current = rec
  }, [])

  // 10-Second Silence Auto-Submission Polling Loop
  useEffect(() => {
    if (step !== 'CALL' || !hasStarted || isAiSpeaking || isProcessingTurn) {
      setSilenceCountdown(null)
      return
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastSpeechTimeRef.current
      const textNotEmpty = userTranscript.trim() !== ''

      if (textNotEmpty) {
        const remaining = Math.max(0, 10 - Math.floor(elapsed / 1000))
        setSilenceCountdown(remaining)

        if (remaining <= 0) {
          handleSubmitAnswer()
        }
      } else {
        setSilenceCountdown(null)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [step, hasStarted, isAiSpeaking, isProcessingTurn, userTranscript])

  // Call Countdown Timer
  useEffect(() => {
    if (step === 'CALL') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleEndInterview()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [step])

  // Speak AI question helper with strict safeguard timers
  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported in this browser.')
      return
    }

    try {
      window.speechSynthesis.cancel() // Stop any current speech queue
      
      if (safeguardTimerRef.current) {
        clearTimeout(safeguardTimerRef.current)
      }

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Choose a premium/natural sounding English voice
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices()
      const englishVoice = 
        voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))) || 
        voices.find(v => v.lang.startsWith('en') && v.name.includes('Microsoft')) ||
        voices.find(v => v.lang.startsWith('en'))

      if (englishVoice) {
        utterance.voice = englishVoice
      }

      // Set voice properties for a natural interviewer pace
      utterance.rate = 0.95 
      utterance.pitch = 1.0

      const handleSpeechEnd = () => {
        if (safeguardTimerRef.current) {
          clearTimeout(safeguardTimerRef.current)
          safeguardTimerRef.current = null
        }
        setIsAiSpeaking(false)
        lastSpeechTimeRef.current = Date.now()
        startSpeechRecognition()
      }

      utterance.onstart = () => {
        setIsAiSpeaking(true)
        setSilenceCountdown(null)
        // Stop listening when AI speaks
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop()
          } catch(e) {}
        }
      }

      utterance.onend = handleSpeechEnd
      
      utterance.onerror = (e: any) => {
        console.error('SpeechSynthesisUtterance error:', e)
        setVoiceEngineError("System voice output failed. This Linux system may be missing speech synthesis packages (e.g. speech-dispatcher, espeak). Access this page via Mac, Windows, iOS, or Android to hear the AI speak.")
        handleSpeechEnd()
      }

      // Safeguard: Force-release call lock if SpeechSynthesis fails silently on Linux
      const wordCount = text.split(/\s+/).length
      const estimatedDurationMs = (wordCount / 140) * 60 * 1000 + 4000 // duration + 4s buffer

      safeguardTimerRef.current = setTimeout(() => {
        console.warn('SpeechSynthesis got stuck or played silently. Triggering safeguard bypass.')
        window.speechSynthesis.cancel()
        handleSpeechEnd()
      }, estimatedDurationMs)

      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.error('Failed to execute speakQuestion:', err)
      setIsAiSpeaking(false)
      startSpeechRecognition()
    }
  }

  const startSpeechRecognition = () => {
    if (recognitionRef.current && !isMuted) {
      setUserTranscript('')
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Recognition already running
      }
    }
  }

  // Handle Mute Mic
  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted // invert because state updates asynchronously
      })
    }
    if (recognitionRef.current) {
      if (!isMuted) {
        try {
          recognitionRef.current.stop()
        } catch(e) {}
        setIsUserSpeaking(false)
      } else {
        startSpeechRecognition()
      }
    }
  }

  // Handle Cam Toggle
  const toggleCam = () => {
    setIsCamOff(!isCamOff)
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isCamOff
      })
    }
  }

  // Start Call Trigger (User clicks JOIN)
  const handleJoinCallRoom = () => {
    setStep('CALL')
  }

  // START Interview Trigger (UNLOCKED INSTANTLY in user click event stack to bypass browser sandbox blocks)
  const handleStartInterview = () => {
    setHasStarted(true)

    // Formulate first question locally on client so browser synthesizes it instantly
    const welcomeText = `Hello! I'm Avenor, your AI interviewer for today. Welcome to your ${interviewType.toLowerCase()} interview for the ${application.role} role at ${application.company}. To start, could you tell me about a recent project you worked on and what made it particularly challenging?`

    setCurrentQuestion(welcomeText)
    const initialHistory = [{ role: 'assistant', content: welcomeText } as const]
    setHistory([...initialHistory])

    // Speak welcome question immediately
    speakQuestion(welcomeText)
  }

  // Submit Answer (Trigger Next Turn)
  const handleSubmitAnswer = async () => {
    if (isProcessingTurn) return
    setIsProcessingTurn(true)
    setSilenceCountdown(null)

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch(e) {}
    }

    const answer = typedAnswerFallback.trim() || userTranscript.trim()
    setTypedAnswerFallback('')
    setUserTranscript('')

    // Fallback if transcript was completely empty and no text typed
    const finalAnswer = answer || 'Candidate finished speaking.'

    const res = await getInterviewTurnAction(application.id, interviewType, history, finalAnswer)
    setIsProcessingTurn(false)

    if (res.success) {
      const { question, isEnded, history: updatedHistory } = res.data
      setHistory(updatedHistory)

      if (isEnded) {
        handleEndInterview(updatedHistory)
      } else {
        setCurrentQuestion(question)
        speakQuestion(question)
      }
    } else {
      alert(res.error)
    }
  }

  // End Interview & Fetch Scorecard
  const handleEndInterview = async (finalHistory = history) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (safeguardTimerRef.current) clearTimeout(safeguardTimerRef.current)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch(e) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    setStep('REPORT')
    setIsProcessingTurn(true)

    const res = await getInterviewEvaluationAction(application.id, interviewType, finalHistory)
    setIsProcessingTurn(false)

    if (res.success) {
      setEvaluation(res.data)
    } else {
      alert(res.error)
    }
  }

  // Format countdown clock
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212', color: '#f5f5f7' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ background: '#1e1e1e', borderBottom: '1px solid #2d2d2d', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href={`/applications/${application.id}`} style={{ color: '#a1a1a6', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} />
            </Link>
            <div>
              <span style={{ fontSize: 10, color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Avenor AI Mock Call
              </span>
              <h1 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: '2px 0 0 0' }}>
                {application.company} — {application.role}
              </h1>
            </div>
          </div>

          {step === 'CALL' && (
            <div style={{ background: 'rgba(235, 107, 72, 0.1)', color: 'var(--color-primary)', padding: '6px 12px', borderRadius: 99, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="blink-dot" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Core Frame */}
        <main style={{ flex: 1, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* STEP 1: LOBBY */}
          {step === 'LOBBY' && (
            <div className="lobby-card animate-slide-up">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'center' }}>
                
                {/* Webcam Preview Tile */}
                <div style={{ background: '#1e1e1e', border: '1px solid #2d2d2d', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!isCamOff ? (
                    <video ref={lobbyVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                  ) : (
                    <div style={{ fontSize: 48 }}>👤</div>
                  )}

                  <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8 }}>
                    <button className={`control-btn-icon ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
                      {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                    <button className={`control-btn-icon ${isCamOff ? 'muted' : ''}`} onClick={toggleCam}>
                      {isCamOff ? <VideoOff size={16} /> : <Video size={16} />}
                    </button>
                  </div>
                </div>

                {/* Pre-Call Setup Panel */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-primary)' }}>
                    <Sparkles size={18} />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Ready to join?
                    </span>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '8px 0 4px 0' }}>Join AI Interview</h2>
                  <p style={{ fontSize: 13, color: '#a1a1a6', margin: 0, lineHeight: 1.5 }}>
                    Practice standard behavioral and technical questions customized directly to this job posting.
                  </p>

                  <div className="setup-details" style={{ margin: '24px 0', borderTop: '1px solid #2d2d2d', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#a1a1a6' }}>Session Type:</span>
                      <strong style={{ color: 'white' }}>{interviewType} Interview</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#a1a1a6' }}>Max Duration:</span>
                      <strong style={{ color: 'white' }}>10 Minutes</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#a1a1a6' }}>Interviewer:</span>
                      <strong style={{ color: 'white' }}>Avenor AI Engine</strong>
                    </div>
                  </div>

                  <button className="btn-join-call" onClick={handleJoinCallRoom}>
                    <Play size={16} fill="white" />
                    <span>Join Room</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: CALL IN PROGRESS */}
          {step === 'CALL' && (
            <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {!hasStarted ? (
                /* START INTERVIEW SANDBOX UNLOCK COVER SCREEN */
                <div className="content-card start-prompt-card animate-slide-up">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', padding: '32px 0' }}>
                    <div className="start-icon-container">
                      <Volume2 size={36} color="var(--color-primary)" />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>Start Your AI Voice Call</h2>
                    <p style={{ fontSize: 13, color: '#a1a1a6', margin: '0 0 8px 0', maxWidth: 420, lineHeight: 1.5 }}>
                      Click "Start Interview" to initialize the voice engine. The AI interviewer will introduce themselves and voice the first question.
                    </p>
                    <button className="btn-primary" style={{ height: 40, padding: '0 24px', fontSize: 13, fontWeight: 700, borderRadius: 'var(--radius-md)' }} onClick={handleStartInterview}>
                      <span>Start Interview</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {voiceEngineError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(235, 107, 72, 0.15)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13, color: '#f5f5f7' }}>
                      <ShieldAlert size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: 'white', display: 'block', marginBottom: 2 }}>Browser Audio Warning:</strong>
                        <span>{voiceEngineError}</span>
                      </div>
                    </div>
                  )}
                  {/* Call Grid */}
                  <div className="call-grid">
                    
                    {/* AI Recruiter Tile */}
                    <div className="call-tile interviewer-tile">
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <div className={`avatar-container ${isAiSpeaking ? 'pulsing' : ''}`}>
                          <div className="avatar-letter">🤖</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Avenor AI Interviewer</div>
                          <div style={{ fontSize: 11, color: isAiSpeaking ? 'var(--color-primary)' : '#a1a1a6', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                            {isAiSpeaking ? 'Speaking...' : 'Listening...'}
                          </div>
                        </div>
                      </div>

                      {/* Subtitle overlay */}
                      {subtitlesEnabled && currentQuestion && (
                        <div className="subtitle-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, textAlign: 'center', color: '#f5f5f7' }}>
                            {currentQuestion}
                          </p>
                          <button 
                            className="control-btn-icon" 
                            style={{ width: 24, height: 24, marginTop: 4 }} 
                            onClick={() => speakQuestion(currentQuestion)}
                            title="Replay Audio (Click to speak question)"
                          >
                            <Volume2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* User Camera Tile */}
                    <div className="call-tile user-tile">
                      {!isCamOff ? (
                        <video ref={callVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#3a3a3c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                            👤
                          </div>
                          <span style={{ fontSize: 12, color: '#a1a1a6' }}>Camera is Off</span>
                        </div>
                      )}

                      {/* Live user transcript indicator */}
                      {userTranscript && (
                        <div className="transcript-overlay">
                          <p style={{ margin: 0, fontSize: 12, color: '#e5e5ea', fontStyle: 'italic' }}>
                            "{userTranscript}"
                          </p>
                        </div>
                      )}

                      {/* Real-time Dynamic Mic Indicator Wave-level bar */}
                      {!isMuted && (
                        <div className="mic-visualizer-bar-container">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Mic size={10} color={micLevel > 15 ? '#34c759' : '#a1a1a6'} />
                            <div className="waveform-container">
                              {[1, 2, 3, 4, 5].map((i) => {
                                // Dynamic wave level bar heights mapping
                                const baseHeight = 4
                                const activityFactor = micLevel > 15 ? (micLevel / 100) : 0
                                const heightScale = activityFactor > 0 ? Math.max(1, activityFactor * 16 * (1 - Math.abs(3 - i) * 0.2)) : 1
                                return (
                                  <div 
                                    key={i} 
                                    className="waveform-bar" 
                                    style={{ 
                                      height: Math.max(baseHeight, heightScale), 
                                      background: micLevel > 15 ? '#34c759' : '#8e8e93' 
                                    }} 
                                  />
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Dynamic Auto-Submit Countdown HUD Warning */}
                  {silenceCountdown !== null && silenceCountdown > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center' }} className="animate-pulse">
                      <div style={{ background: 'rgba(235, 107, 72, 0.15)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '6px 16px', fontSize: 12, fontWeight: 700 }}>
                        No speech detected. Submitting answer in {silenceCountdown}s...
                      </div>
                    </div>
                  )}

                  {/* Typed Fallback Input Box (If microphone API fails or user prefers typing) */}
                  {(!isSpeechSupported || isMuted) && (
                    <div style={{ display: 'flex', gap: 8, background: '#1e1e1e', border: '1px solid #2d2d2d', borderRadius: 'var(--radius-xl)', padding: 12 }}>
                      <input 
                        type="text" 
                        placeholder="Type your response here if mic is muted..." 
                        className="chat-text-input" 
                        value={typedAnswerFallback}
                        onChange={(e) => setTypedAnswerFallback(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitAnswer(); }}
                      />
                      <button className="btn-primary text-btn" onClick={handleSubmitAnswer} disabled={isProcessingTurn || !typedAnswerFallback.trim()}>
                        Send Answer
                      </button>
                    </div>
                  )}

                  {/* Bottom toolbar */}
                  <div className="call-toolbar">
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className={`toolbar-btn ${isMuted ? 'active' : ''}`} onClick={toggleMute} title={isMuted ? 'Unmute microphone' : 'Mute microphone'}>
                        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                      <button className={`toolbar-btn ${isCamOff ? 'active' : ''}`} onClick={toggleCam} title={isCamOff ? 'Turn video on' : 'Turn video off'}>
                        {isCamOff ? <VideoOff size={18} /> : <Video size={18} />}
                      </button>
                      <button className={`toolbar-btn ${!subtitlesEnabled ? 'active' : ''}`} onClick={() => setSubtitlesEnabled(!subtitlesEnabled)} title="Toggle Subtitles">
                        <Type size={18} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {!isAiSpeaking && (
                        <button className="btn-submit-answer" onClick={handleSubmitAnswer} disabled={isProcessingTurn}>
                          {isProcessingTurn ? (
                            <Loader2 size={13} className="animate-spin" style={{ marginRight: 6 }} />
                          ) : (
                            <span>Done Answering</span>
                          )}
                        </button>
                      )}

                      <button className="btn-hang-up" onClick={() => handleEndInterview()}>
                        <PhoneOff size={16} />
                        <span>End Interview</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 3: FINAL SCORECARD REPORT */}
          {step === 'REPORT' && (
            <div style={{ width: '100%', maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-slide-up">
              
              {isProcessingTurn || !evaluation ? (
                <div className="content-card" style={{ background: '#1e1e1e', border: '1px solid #2d2d2d', padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <Loader2 size={36} className="animate-spin" color="var(--color-primary)" />
                  <h3 style={{ fontSize: 16, color: 'white', margin: 0 }}>Compiling Scorecard Audit...</h3>
                  <p style={{ fontSize: 13, color: '#a1a1a6', margin: 0 }}>
                    Gemini AI is analyzing your transcripts, vocabulary complexity, and structural alignment.
                  </p>
                </div>
              ) : (
                <>
                  {/* Scorecard Header Summary */}
                  <div className="content-card" style={{ background: '#1e1e1e', border: '1px solid #2d2d2d', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Award size={16} color="var(--color-primary)" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          AI Evaluation Completed
                        </span>
                      </div>
                      <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginTop: 8, marginBottom: 4 }}>
                        Mock Interview Scorecard
                      </h2>
                      <p style={{ fontSize: 13, color: '#a1a1a6', margin: 0, lineHeight: 1.5 }}>
                        Audited outcomes based on your structural and communication alignment.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Outcome</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          {evaluation.decision === 'Hired' ? (
                            <div style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34c759', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} />
                              <span>HIRED</span>
                            </div>
                          ) : (
                            <div style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <XCircle size={12} />
                              <span>NOT HIRED</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(235, 107, 72, 0.1)', color: 'var(--color-primary)', width: 72, height: 72, borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 24, fontWeight: 900 }}>{evaluation.score}</span>
                        <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Breakdown grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    
                    {/* Strengths Card */}
                    <div className="content-card" style={{ background: '#1e1e1e', border: '1px solid #2d2d2d' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#34c759', margin: '0 0 12px 0' }}>Key Strengths</h3>
                      <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#e5e5ea', lineHeight: 1.5 }}>
                        {evaluation.strengths.map((str: string, idx: number) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses Card */}
                    <div className="content-card" style={{ background: '#1e1e1e', border: '1px solid #2d2d2d' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ff3b30', margin: '0 0 12px 0' }}>Areas to Improve</h3>
                      <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#e5e5ea', lineHeight: 1.5 }}>
                        {evaluation.weaknesses.map((weak: string, idx: number) => (
                          <li key={idx}>{weak}</li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Improvement Action Tips */}
                  <div className="content-card" style={{ background: '#1e1e1e', border: '1px solid #2d2d2d' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 12px 0' }}>Actionable Coaching Tips</h3>
                    <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#e5e5ea', lineHeight: 1.5 }}>
                      {evaluation.tips.map((tip: string, idx: number) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Navigation Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <Link href={`/applications/${application.id}`} style={{ textDecoration: 'none' }}>
                      <button className="btn-secondary" style={{ color: 'white', borderColor: '#3a3a3c', background: '#1c1c1e' }}>
                        Back to Application Detail
                      </button>
                    </Link>
                  </div>
                </>
              )}

            </div>
          )}

        </main>
      </div>

      <style>{`
        /* Webcam Lobby layout styling */
        .lobby-card {
          background: #1e1e1e;
          border: 1px solid #2d2d2d;
          border-radius: var(--radius-2xl);
          width: 100%;
          maxWidth: 720px;
          padding: 32px;
        }
        
        .control-btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(30, 30, 30, 0.7);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: all 0.15s ease;
        }
        .control-btn-icon:hover {
          background: rgba(235, 107, 72, 0.2);
          color: var(--color-primary);
        }
        .control-btn-icon.muted {
          background: #ff3b30;
          color: white;
        }
        
        .btn-join-call {
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          height: 40px;
          padding: 0 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
          transition: all 0.15s ease;
        }
        .btn-join-call:hover {
          background: var(--color-primary-hover, #aa644d);
          transform: translateY(-1px);
        }

        /* Start Prompt Card */
        .start-prompt-card {
          background: #1e1e1e;
          border: 1px solid #2d2d2d;
          border-radius: var(--radius-2xl);
          padding: 48px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }

        .start-icon-container {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(235, 107, 72, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Video Conference Grid Layout */
        .call-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          width: 100%;
        }
        
        .call-tile {
          background: #1e1e1e;
          border: 1px solid #2d2d2d;
          border-radius: var(--radius-xl);
          aspect-ratio: 4/3;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .user-tile video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }
        
        .avatar-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #2d2d2d;
          border: 2px solid #3a3a3c;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .avatar-container.pulsing {
          border-color: var(--color-primary);
          box-shadow: 0 0 16px rgba(235, 107, 72, 0.4);
          animation: wave-pulse 1.5s infinite;
        }
        .avatar-letter {
          font-size: 32px;
        }
        
        @keyframes wave-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        /* Floating HUD elements */
        .subtitle-overlay {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          background: rgba(30, 30, 30, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          padding: 10px 16px;
        }
        
        .speaking-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          background: #34c759;
          color: white;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }
        
        .transcript-overlay {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          border-radius: var(--radius-md);
          padding: 8px 12px;
        }

        /* Mic wave visualizer overlay */
        .mic-visualizer-bar-container {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          border-radius: var(--radius-md);
          padding: 6px 10px;
          display: flex;
          align-items: center;
          z-index: 10;
        }

        .waveform-container {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 16px;
          padding: 0 4px;
        }

        .waveform-bar {
          width: 3px;
          border-radius: 99px;
          transition: height 0.08s linear;
        }
        
        /* Chat fallback input */
        .chat-text-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 13px;
        }
        
        /* bottom controls bar */
        .call-toolbar {
          background: #1e1e1e;
          border: 1px solid #2d2d2d;
          border-radius: var(--radius-xl);
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .toolbar-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          border: 1px solid #2d2d2d;
          background: #1c1c1e;
          color: #a1a1a6;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .toolbar-btn:hover {
          color: white;
          background: #2c2c2e;
        }
        .toolbar-btn.active {
          background: #ff3b30;
          border-color: #ff3b30;
          color: white;
        }
        
        .btn-submit-answer {
          background: #34c759;
          color: white;
          border: none;
          border-radius: var(--radius-md);
          height: 36px;
          padding: 0 16px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-submit-answer:hover {
          background: #30b351;
        }
        
        .btn-hang-up {
          background: #ff3b30;
          color: white;
          border: none;
          border-radius: var(--radius-md);
          height: 36px;
          padding: 0 16px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-hang-up:hover {
          background: #e0352b;
        }
        
        .blink-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-primary);
          animation: blink 1s infinite alternate;
        }
        @keyframes blink {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  )
}
