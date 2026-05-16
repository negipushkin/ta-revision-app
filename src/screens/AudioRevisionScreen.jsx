import { useState, useEffect, useRef } from 'react'

export default function AudioRevisionScreen({ questions, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | question | answer | explanation | waiting | paused | done
  const [waitSeconds, setWaitSeconds] = useState(5)

  const activeRef = useRef(false)
  const waitTimerRef = useRef(null)
  // Web Audio context kept alive so the browser doesn't suspend audio on lock screen
  const audioCtxRef = useRef(null)
  const silentSourceRef = useRef(null)
  // Periodic heartbeat: Chrome Android cuts speechSynthesis after ~15s in background
  const heartbeatRef = useRef(null)
  const voiceRef = useRef(null)

  // Resolve Google English India voice; voices load asynchronously on first call
  useEffect(() => {
    function pickVoice() {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return
      voiceRef.current =
        voices.find(v => v.name === 'Google English India') ||
        voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('google')) ||
        voices.find(v => v.lang === 'en-IN') ||
        null
    }
    pickVoice()
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice)
  }, [])

  const isPlaying = ['question', 'answer', 'explanation', 'waiting'].includes(phase)

  // Countdown timer during waiting phase
  useEffect(() => {
    if (phase !== 'waiting') { setWaitSeconds(5); return }
    setWaitSeconds(5)
    const iv = setInterval(() => setWaitSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(iv)
  }, [phase])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false
      window.speechSynthesis.cancel()
      if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
      stopKeepAlive()
    }
  }, [])

  function startKeepAlive() {
    // 1. Silent oscillator — keeps the browser audio engine from suspending
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.value = 0 // completely silent
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      silentSourceRef.current = osc
    } catch (_) {}

    // 2. MediaSession — tells the OS that media is playing; shows lock-screen controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Audio Revision',
        artist: 'TA Prep',
        album: 'Question Bank',
      })
      navigator.mediaSession.playbackState = 'playing'
      navigator.mediaSession.setActionHandler('pause', handlePause)
      navigator.mediaSession.setActionHandler('play', handlePlay)
      navigator.mediaSession.setActionHandler('nexttrack', handleNext)
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev)
    }

    // 3. Heartbeat — Chrome Android kills speechSynthesis after ~15s in background;
    //    pausing + resuming resets that timer without audibly interrupting speech.
    heartbeatRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }
    }, 10000)
  }

  function stopKeepAlive() {
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null }
    try { silentSourceRef.current?.stop() } catch (_) {}
    try { audioCtxRef.current?.close() } catch (_) {}
    silentSourceRef.current = null
    audioCtxRef.current = null
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none'
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
    }
  }

  function speakText(text, onEnd) {
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.85
    u.lang = 'en-IN'
    if (voiceRef.current) u.voice = voiceRef.current
    u.onend = onEnd
    u.onerror = (e) => { if (e.error !== 'interrupted') onEnd() }
    window.speechSynthesis.speak(u)
  }

  function doQuestion(index) {
    if (!activeRef.current) return
    if (index >= questions.length) { setPhase('done'); stopKeepAlive(); return }

    setCurrentIndex(index)
    const q = questions[index]

    // Keep lock-screen metadata current
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Q${q.id}: ${q.question.slice(0, 60)}`,
        artist: q.subtopic || 'TA Revision',
        album: 'Audio Revision',
      })
    }

    setPhase('question')
    speakText(`Question ${q.id}. ${q.question}`, () => {
      if (!activeRef.current) return
      setPhase('answer')
      speakText(`The correct answer is ${q.answer}. ${q.options[q.answer] || ''}.`, () => {
        if (!activeRef.current) return
        setPhase('explanation')
        speakText(q.explanation || 'No explanation available.', () => {
          if (!activeRef.current) return
          setPhase('waiting')
          waitTimerRef.current = setTimeout(() => {
            if (!activeRef.current) return
            doQuestion(index + 1)
          }, 5000)
        })
      })
    })
  }

  function cancelAll() {
    activeRef.current = false
    window.speechSynthesis.cancel()
    if (waitTimerRef.current) { clearTimeout(waitTimerRef.current); waitTimerRef.current = null }
  }

  function handlePlay() {
    activeRef.current = true
    startKeepAlive()
    doQuestion(currentIndex)
  }

  function handlePause() {
    cancelAll()
    stopKeepAlive()
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
    setPhase('paused')
  }

  function handleStop() {
    cancelAll()
    stopKeepAlive()
    onBack()
  }

  function handlePrev() {
    const prev = Math.max(0, currentIndex - 1)
    const wasPlaying = isPlaying
    cancelAll()
    setCurrentIndex(prev)
    if (wasPlaying) {
      activeRef.current = true
      doQuestion(prev)
    } else {
      setPhase('paused')
    }
  }

  function handleNext() {
    const next = Math.min(questions.length - 1, currentIndex + 1)
    const wasPlaying = isPlaying
    cancelAll()
    setCurrentIndex(next)
    if (wasPlaying) {
      activeRef.current = true
      doQuestion(next)
    } else {
      setPhase('paused')
    }
  }

  const q = questions[currentIndex]
  const progressPct = questions.length > 1 ? (currentIndex / (questions.length - 1)) * 100 : 100

  const phaseLabel =
    phase === 'idle' ? 'Press Play to begin' :
    phase === 'question' ? 'Reading question...' :
    phase === 'answer' ? 'Reading answer...' :
    phase === 'explanation' ? 'Reading explanation...' :
    phase === 'waiting' ? `Next in ${waitSeconds}s` :
    phase === 'paused' ? 'Paused — press Play to resume' :
    'Complete'

  const phaseCls =
    phase === 'question' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40' :
    phase === 'answer' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' :
    phase === 'explanation' ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40' :
    'bg-slate-700/80 text-slate-400'

  const showAnswer = phase !== 'question' || !isPlaying
  const showExplanation = !['question', 'answer'].includes(phase) || !isPlaying

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-3">
        <button
          onClick={handleStop}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-600 text-slate-300 active:bg-slate-700 transition-colors"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Audio Revision</h1>
        </div>
        <span className="text-sm text-slate-400 tabular-nums">{currentIndex + 1} / {questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 mx-5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Phase badge */}
      <div className="flex justify-center mt-4 px-5">
        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${phaseCls}`}>
          {phaseLabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 mt-4 pb-3 flex flex-col gap-3">
        {phase === 'done' ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
            <p className="text-white text-xl font-semibold">All questions complete!</p>
            <p className="text-slate-400 text-sm">{questions.length} questions covered</p>
            <button
              onClick={onBack}
              className="mt-2 h-11 px-6 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:bg-indigo-700"
            >
              Back to Home
            </button>
          </div>
        ) : q ? (
          <>
            {/* Question card */}
            <div className={`rounded-2xl p-4 transition-colors duration-300 ${phase === 'question' ? 'bg-indigo-600/15 border border-indigo-500/40' : 'bg-[#1e293b]'}`}>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">Question {q.id}</p>
              <p className="text-white text-sm leading-relaxed">{q.question}</p>
            </div>

            {/* Answer card — revealed once question phase ends */}
            <div className={`rounded-2xl p-4 transition-colors duration-300 ${phase === 'answer' ? 'bg-emerald-600/15 border border-emerald-500/40' : 'bg-[#1e293b]'} ${!showAnswer ? 'opacity-30' : ''}`}>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">Correct Answer</p>
              {showAnswer ? (
                <p className="text-emerald-400 text-sm font-semibold">{q.answer}. {q.options[q.answer]}</p>
              ) : (
                <p className="text-slate-600 text-sm">Revealed after question is read</p>
              )}
            </div>

            {/* Explanation card — revealed once answer phase ends */}
            <div className={`rounded-2xl p-4 transition-colors duration-300 ${phase === 'explanation' ? 'bg-amber-600/15 border border-amber-500/40' : 'bg-[#1e293b]'} ${!showExplanation ? 'opacity-30' : ''}`}>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">Explanation</p>
              {showExplanation ? (
                <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
              ) : (
                <p className="text-slate-600 text-sm">Revealed after answer is read</p>
              )}
            </div>

            {/* Tags */}
            {(phase === 'waiting' || phase === 'paused' || !isPlaying) && (
              <div className="flex flex-wrap gap-2 pb-1">
                {q.subtopic && (
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{q.subtopic}</span>
                )}
                {q.difficulty && (
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{q.difficulty}</span>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Controls */}
      {phase !== 'done' && (
        <div className="px-5 pb-8 pt-2 flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-600 text-slate-300 active:bg-slate-700 disabled:opacity-30 transition-colors text-xs font-bold"
          >
            Prev
          </button>

          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="flex-1 h-12 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:bg-indigo-700 transition-colors"
          >
            {isPlaying ? 'Pause' : phase === 'paused' ? 'Resume' : 'Play'}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-600 text-slate-300 active:bg-slate-700 disabled:opacity-30 transition-colors text-xs font-bold"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
