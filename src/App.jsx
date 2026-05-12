import { useState } from 'react'
import RevisionScreen from './screens/RevisionScreen'
import SummaryScreen from './screens/SummaryScreen'
import HomeScreen from './screens/HomeScreen'
import useQuestions from './data/useQuestions'
import { getMarkedIds } from './store/progressStore'

export default function App() {
  const [screen, setScreen] = useState('home')
  const [reviewIds, setReviewIds] = useState(null)
  const { allQuestions } = useQuestions()

  const handleRevise = () => {
    setReviewIds(null)
    setScreen('revision')
  }

  const handleReview = () => {
    setReviewIds(getMarkedIds())
    setScreen('revision')
  }

  const handleGoHome = () => {
    setReviewIds(null)
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
          onSummary={() => setScreen('summary')}
        />
      )}
      {screen === 'revision' && (
        <RevisionScreen
          setScreen={setScreen}
          reviewIds={reviewIds}
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
