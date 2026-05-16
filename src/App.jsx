import { useState, useEffect } from 'react'
import { loadFromCloud, getMarkedIds } from './store/progressStore'
import RevisionScreen from './screens/RevisionScreen'
import SummaryScreen from './screens/SummaryScreen'
import HomeScreen from './screens/HomeScreen'
import CustomTestSetupScreen from './screens/CustomTestSetupScreen'
import AudioRevisionSetupScreen from './screens/AudioRevisionSetupScreen'
import AudioRevisionScreen from './screens/AudioRevisionScreen'
import useQuestions from './data/useQuestions'

export default function App() {
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState('home')
  const [reviewIds, setReviewIds] = useState(null)
  const [testIds, setTestIds] = useState(null)
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(null)
  const [audioQuestions, setAudioQuestions] = useState(null)
  const { allQuestions } = useQuestions()

  useEffect(() => {
    loadFromCloud().then(() => setReady(true))
  }, [])

  const handleRevise = () => {
    setReviewIds(null)
    setTestIds(null)
    setScreen('revision')
  }

  const handleReview = () => {
    setReviewIds(getMarkedIds())
    setTestIds(null)
    setScreen('revision')
  }

  const handleCustomTest = (ids, timeLimit) => {
    setTestIds(ids)
    setTimeLimitSeconds(timeLimit)
    setReviewIds(null)
    setScreen('revision')
  }

  const handleAudioRevisionStart = (questions) => {
    setAudioQuestions(questions)
    setScreen('audioRevision')
  }

  const handleGoHome = () => {
    setReviewIds(null)
    setTestIds(null)
    setTimeLimitSeconds(null)
    setAudioQuestions(null)
    setScreen('home')
  }

  if (!ready) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-3"
        style={{ maxWidth: 390, margin: '0 auto', backgroundColor: '#0f172a' }}
      >
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ maxWidth: 390, margin: '0 auto', backgroundColor: '#0f172a' }}
    >
      {screen === 'home' && (
        <HomeScreen
          allQuestions={allQuestions}
          onRevise={handleRevise}
          onReview={handleReview}
          onCustomTest={() => setScreen('customTest')}
          onAudioRevision={() => setScreen('audioRevisionSetup')}
          onSummary={() => setScreen('summary')}
        />
      )}
      {screen === 'customTest' && (
        <CustomTestSetupScreen
          allQuestions={allQuestions}
          onStart={handleCustomTest}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'revision' && (
        <RevisionScreen
          setScreen={setScreen}
          reviewIds={reviewIds}
          testIds={testIds}
          timeLimitSeconds={timeLimitSeconds}
          onGoHome={handleGoHome}
        />
      )}
      {screen === 'audioRevisionSetup' && (
        <AudioRevisionSetupScreen
          allQuestions={allQuestions}
          onStart={handleAudioRevisionStart}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'audioRevision' && audioQuestions && (
        <AudioRevisionScreen
          questions={audioQuestions}
          onBack={handleGoHome}
        />
      )}
      {screen === 'summary' && (
        <SummaryScreen
          setScreen={setScreen}
          allQuestions={allQuestions}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  )
}
