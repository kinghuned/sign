import { useEffect, useRef, useState } from 'react'

interface SpeechToTextOptions {
  interimResults?: boolean
  lang?: string
  continuous?: boolean
}

export default function useSpeechToText(options: SpeechToTextOptions) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Web speech api is not supported.')
      return
    }

    recognitionRef.current = new window.webkitSpeechRecognition()
    const recognition = recognitionRef.current

    recognition.interimResults = options.interimResults || true
    recognition.lang = options.lang || 'en'
    recognition.continuous = options.continuous || false

    if ('webkitSpeechGrammarList' in window) {
      const grammar = '#JSGF V1.0; grammar punctuation; public <punc> = . | , | ? | ! | ; | :'
      const speechRecognitionList = new window.webkitSpeechGrammarList()
      speechRecognitionList.addFromString(grammar, 1)
      recognition.grammars = speechRecognitionList
    }

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript
      }
      setTranscript(text)
      console.log('text: ', text)
    }

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.log('Speech recognition error: ', e.error)
    }

    recognition.onend = () => {
      setIsListening(false)
      // setTranscript('')
    }

    return () => {
      recognition?.stop() // Optional chaining to handle potential null reference
    }
  }, [options.continuous, options.interimResults, options.lang])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  return {
    isListening,
    transcript,
    startListening,
    stopListening
  }
}
