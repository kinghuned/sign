'use client'
import { Box } from '@mui/material'
import { Suspense, useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import Content from '../../components/content/content'
import LanguageList from '../../components/language_list/language_list'
import OptionList from '../../components/option_list/option_list'

interface SignToTextProps {}

export default function SignToText(props: SignToTextProps) {
  const isRevert: boolean = true
  const webcamRef = useRef<Webcam>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [capturing, setCapturing] = useState<boolean>(false)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const [uploading, setUploading] = useState<boolean>(false)
  const [predictSign, setPredictSign] = useState<string>('')

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true)
    const stream = webcamRef.current?.stream
    if (stream) {
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      })
      mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable)
      mediaRecorderRef.current.start()
    }
  }, [webcamRef, setCapturing, mediaRecorderRef])

  const handleDataAvailable = useCallback(
    ({ data }: BlobEvent) => {
      if (data.size > 0) {
        setRecordedChunks(prev => prev.concat(data))
      }
    },
    [setRecordedChunks]
  )

  const handleUpload = useCallback(async () => {
    setUploading(true)
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm'
      })

      const formData = new FormData()
      formData.append('video', blob, 'react-webcam-stream-capture.webm')

      const response = await fetch('https://172.25.41.23:8000/translate/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        console.log('Video uploaded successfully')
        const result = await response.json()
        setPredictSign(result.data)
        setRecordedChunks([])
      } else {
        console.error('Failed to upload video')
      }
      setUploading(false)
    }
  }, [recordedChunks])

  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    setCapturing(false)
  }, [mediaRecorderRef, webcamRef, setCapturing])

  return (
    <Box>
      <OptionList
        isRevert={isRevert}
        capturing={capturing}
        uploading={uploading}
        handleStartCaptureClick={handleStartCaptureClick}
        handleStopCaptureClick={handleStopCaptureClick}
        handleUpload={handleUpload}
        recordedChunks={recordedChunks}
      />
      <Suspense>
        <LanguageList isRevert={isRevert} />
      </Suspense>
      <Suspense>
        <Content isRevert={isRevert} webcamRef={webcamRef} predictSign={predictSign} />
      </Suspense>
    </Box>
  )
}
