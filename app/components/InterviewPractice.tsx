"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import SpeechRecognition from "./SpeechRecognition"
import { processSpeech } from "../actions/processSpeech"

const recruiterQuestions = [
  "Tell me about yourself and your background.",
  "Why are you interested in this position?",
  "What do you know about our company?",
  "Can you walk me through your resume?",
  "What are your salary expectations?",
  "Why are you looking to leave your current role?",
  "What are your strengths and weaknesses?",
  "Where do you see yourself in 5 years?",
  "Do you have any questions for me about the role or company?",
]

export default function InterviewPractice() {
  const [feedback, setFeedback] = useState("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showSpeechRecognition, setShowSpeechRecognition] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
        setError("Speech recognition is not supported in this browser.")
      }
    }
  }, [])

  const handleSpeechResult = async (result: string) => {
    console.log("Speech recognition result:", result)
    if (!result.trim()) {
      setFeedback("No speech was detected. Please try again.")
      setShowSpeechRecognition(false)
      return
    }
    setIsProcessing(true)
    try {
      const response = await processSpeech(recruiterQuestions[currentQuestionIndex], result)
      setFeedback(response)
    } catch (error) {
      console.error("Error processing speech:", error)
      setError("An error occurred while processing your answer. Please try again.")
    }
    setIsProcessing(false)
    setShowSpeechRecognition(false)
  }

  const handleSpeechError = (error: string) => {
    console.error("Speech recognition error:", error)
    setErrorMessage(error)
    setShowSpeechRecognition(false)
  }

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % recruiterQuestions.length)
    setFeedback("")
    setShowSpeechRecognition(false)
    setError(null)
    setErrorMessage(null)
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => setError(null)} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{recruiterQuestions[currentQuestionIndex]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm">
            <li>Click "Start Recording" when you're ready to answer.</li>
            <li>Speak clearly into your microphone.</li>
            <li>The recording will automatically stop after a brief pause in speech.</li>
            <li>If you encounter issues, try refreshing the page or checking your browser settings.</li>
          </ol>
        </div>
        {!showSpeechRecognition && !isProcessing && (
          <Button onClick={() => setShowSpeechRecognition(true)} className="w-full">
            Start Recording
          </Button>
        )}
        {showSpeechRecognition && <SpeechRecognition onResult={handleSpeechResult} onError={handleSpeechError} />}
        {isProcessing && <p className="text-center">Processing your answer...</p>}
        {feedback && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Feedback:</h3>
            <div dangerouslySetInnerHTML={{ __html: feedback }} className="bg-gray-50 p-4 rounded-md" />
          </div>
        )}
        <Button onClick={handleNextQuestion} disabled={isProcessing} className="w-full mt-4">
          Next Question
        </Button>
      </CardContent>
    </Card>
  )
}

