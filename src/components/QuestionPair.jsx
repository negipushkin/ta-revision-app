import QuestionCard from './QuestionCard'

export default function QuestionPair({ questions, onAnswer, fresh = false, shuffleOptions = false }) {
  return (
    <div className="flex flex-col gap-4">
      {questions[0] && (
        <QuestionCard
          key={questions[0].id}
          question={questions[0]}
          onAnswer={(isCorrect, sel) => onAnswer(questions[0].id, isCorrect, sel)}
          fresh={fresh}
          shuffleOptions={shuffleOptions}
        />
      )}
      {questions[1] && (
        <>
          <div className="border-t border-slate-700/60" />
          <QuestionCard
            key={questions[1].id}
            question={questions[1]}
            onAnswer={(isCorrect, sel) => onAnswer(questions[1].id, isCorrect, sel)}
            fresh={fresh}
            shuffleOptions={shuffleOptions}
          />
        </>
      )}
    </div>
  )
}
