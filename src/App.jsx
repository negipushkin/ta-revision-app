import { useState } from 'react'
import RevisionScreen from './screens/RevisionScreen'
import SummaryScreen from './screens/SummaryScreen'
import HomeScreen from './screens/HomeScreen'
import CustomTestSetupScreen from './screens/CustomTestSetupScreen'
import useQuestions from './data/useQuestions'
import { getMarkedIds } from './store/progressStore'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [reviewIds, setReviewIds] = useState(null)
  const [testIds, setTestIds] = useState(null)
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(null)
  const { allQuestions } = useQuestions()

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

  const handleGoHome = () => {
    setReviewIds(null)
    setTestIds(null)
    setTimeLimitSeconds(null)
    setScreen('home')
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
