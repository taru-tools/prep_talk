"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "../../components/ui/button"

interface SpeechRecognitionProps {
  onResult: (result: string) => void
  onError: (error: string) => void
}

export default function SpeechRecognition({ onResult, onError }: SpeechRecognitionProps) {
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startRecognition = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")

    if (typeof window === "undefined") {
      onError("Speech recognition is not available in this environment")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      onError("Speech recognition is not supported in this browser")
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = "en-US"

    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started")
      setIsListening(true)
    }

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript((prevTranscript) => prevTranscript + finalTranscript)
      setInterimTranscript(interimTranscript)

      console.log("Current transcript:", transcript + interimTranscript)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      }, 1500)
    }

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error, event.message)
      onError(`Speech recognition error: ${event.error}. ${event.message || ""}`)
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended")
      setIsListening(false)
      if (transcript.trim()) {
        onResult(transcript.trim())
      }
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      onError("Error starting speech recognition")
    }
  }, [onResult, onError, transcript])

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopRecognition()
    }
  }, [stopRecognition])

  const handleToggleListening = () => {
    if (isListening) {
      stopRecognition()
    } else {
      startRecognition()
    }
  }

  return (
    <div className="mt-4">
      <Button onClick={handleToggleListening}>{isListening ? "Stop Listening" : "Start Listening"}</Button>
      <p className="font-semibold mt-2">Status: {isListening ? "Listening..." : "Not listening"}</p>
      <p className="font-semibold mt-2">Transcript:</p>
      <p>
        {transcript}
        <span className="text-gray-500">{interimTranscript}</span>
      </p>
    </div>
  )
}