'use client'
import { VolumeUpRounded } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useState } from 'react'

interface TextToAudioProps {
  text: string
}

export default function TextToAudio({ text }: TextToAudioProps) {
  let msg = null

  if (typeof window !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined') {
    msg = new SpeechSynthesisUtterance()
  }

  const speechHandler = () => {
    if (msg) {
      msg.text = text
      window.speechSynthesis.speak(msg)
    } else {
      console.error('SpeechSynthesisUtterance is not supported in this environment.')
    }
  }

  return (
    <IconButton onClick={speechHandler}>
      <VolumeUpRounded />
    </IconButton>
  )
}
