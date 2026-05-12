import { useState } from 'react'
import RevisionScreen from './screens/RevisionScreen'
import SummaryScreen from './screens/SummaryScreen'
import useQuestions from './data/useQuestions'

export default function App() {
  const [screen, setScreen] = useState('revision')
  const { allQuestions } = useQuestions()

  return (
    <div
      className="h-full flex flex-col"
      style={{ maxWidth: 390, margin: '0 auto', backgroundColor: '#0f172a' }}
    >
      {screen === 'revision' && <RevisionScreen setScreen={setScreen} />}
      {screen === 'summary' && <SummaryScreen setScreen={setScreen} allQuestions={allQuestions} />}
    </div>
  )
}
