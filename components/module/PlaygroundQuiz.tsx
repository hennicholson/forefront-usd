'use client';

import React, { useState } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface PlaygroundQuizProps {
  sessionId?: string;
  moduleContext?: {
    title: string;
    category: string;
  };
}

export const PlaygroundQuiz: React.FC<PlaygroundQuizProps> = ({ sessionId, moduleContext }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setIsSubmitted(false);
    setSelectedAnswers({});

    try {
      const response = await fetch('/api/playground/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          moduleContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setIsSubmitted(true);
  };

  const getAnswerStyle = (questionId: string, optionIndex: number): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      border: '1px solid #fff',
      padding: '12px',
      cursor: isSubmitted ? 'default' : 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: "'Core Sans A 65 Bold', sans-serif",
      fontSize: '14px',
      color: '#fff',
      backgroundColor: '#000',
    };

    const isSelected = selectedAnswers[questionId] === optionIndex;

    if (!isSubmitted) {
      if (isSelected) {
        return {
          ...baseStyle,
          backgroundColor: '#fff',
          color: '#000',
        };
      }
      return baseStyle;
    }

    const question = questions.find((q) => q.id === questionId);
    if (!question) return baseStyle;

    const isCorrect = optionIndex === question.correctAnswer;
    const wasSelected = isSelected;

    if (isCorrect) {
      return {
        ...baseStyle,
        borderColor: '#00ff00',
        backgroundColor: wasSelected ? '#00ff00' : '#000',
        color: wasSelected ? '#000' : '#00ff00',
      };
    }

    if (wasSelected && !isCorrect) {
      return {
        ...baseStyle,
        borderColor: '#ff0000',
        backgroundColor: '#ff0000',
        color: '#000',
      };
    }

    return {
      ...baseStyle,
      opacity: 0.5,
    };
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#000',
        padding: '20px',
        gap: '16px',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: "'Core Sans A 65 Bold', sans-serif",
          fontSize: '14px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#fff',
        }}
      >
        [QUIZ]
      </div>

      {/* Generate button */}
      {questions.length === 0 && (
        <button
          onClick={handleGenerateQuiz}
          disabled={isLoading}
          style={{
            backgroundColor: '#000',
            border: '1px solid #fff',
            color: '#fff',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isLoading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000';
            e.currentTarget.style.color = '#fff';
          }}
        >
          {isLoading ? '[GENERATING QUIZ...]' : '[GENERATE QUIZ]'}
        </button>
      )}

      {/* Error display */}
      {error && (
        <div
          style={{
            border: '1px solid #ff0000',
            color: '#ff0000',
            padding: '12px',
            fontFamily: "'Core Sans A 65 Bold', sans-serif",
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          [ERROR: {error}]
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {questions.map((question, qIndex) => (
              <div key={question.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    fontFamily: "'Core Sans A 65 Bold', sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#fff',
                  }}
                >
                  [{qIndex + 1}] {question.question}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      onClick={() => handleSelectAnswer(question.id, optIndex)}
                      style={getAnswerStyle(question.id, optIndex)}
                      onMouseEnter={(e) => {
                        if (!isSubmitted && selectedAnswers[question.id] !== optIndex) {
                          e.currentTarget.style.backgroundColor = '#333';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitted && selectedAnswers[question.id] !== optIndex) {
                          e.currentTarget.style.backgroundColor = '#000';
                        }
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit button */}
          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
              style={{
                backgroundColor: '#000',
                border: '1px solid #fff',
                color: '#fff',
                fontFamily: "'Core Sans A 65 Bold', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '16px',
                cursor: Object.keys(selectedAnswers).length !== questions.length ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: Object.keys(selectedAnswers).length !== questions.length ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (Object.keys(selectedAnswers).length === questions.length) {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#000';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000';
                e.currentTarget.style.color = '#fff';
              }}
            >
              [SUBMIT]
            </button>
          )}

          {/* Score display */}
          {isSubmitted && (
            <div
              style={{
                border: '2px solid #fff',
                padding: '20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: '#fff',
                }}
              >
                [YOUR SCORE]
              </div>
              <div
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {score} / {questions.length}
              </div>
              <div
                style={{
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#fff',
                }}
              >
                [{Math.round((score / questions.length) * 100)}%]
              </div>
              <button
                onClick={handleGenerateQuiz}
                style={{
                  backgroundColor: '#000',
                  border: '1px solid #fff',
                  color: '#fff',
                  fontFamily: "'Core Sans A 65 Bold', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: '12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                [TRY AGAIN]
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
