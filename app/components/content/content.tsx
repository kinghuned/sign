'use client'
import useSpeechToText from '@/hooks/useSpeechToText'
import { Box, Stack, TextField, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, createElement, useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import { useDebounce } from 'use-debounce'
import MicroAndCountText from '../micro/micro'
import TextToAudio from '../text_to_audio/text_to_audio'
import styles from './content.module.scss'

const LANG_EN = 'en'
const LANG_VI = 'vi'
const DEFAULT_LANG = LANG_EN

const translateText = async (text: string, from: string, to: string) => {
  const url = new URL('https://microsoft-translator-text.p.rapidapi.com/translate')
  url.searchParams.append('to[0]', to)
  url.searchParams.append('api-version', '3.0')
  url.searchParams.append('from', from)
  url.searchParams.append('profanityAction', 'NoAction')
  url.searchParams.append('textType', 'plain')

  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY!,
      'X-RapidAPI-Host': process.env.NEXT_PUBLIC_RAPIDAPI_HOST!
    },
    body: JSON.stringify([
      {
        Text: text
      }
    ])
  }

  try {
    const response = await fetch(url.toString(), options)
    const result = await response.json()
    return result[0].translations[0].text
  } catch (error) {
    console.error(error)
    return null
  }
}

export interface ContentProps {
  isRevert: boolean
  predictSign?: string
  webcamRef?: React.MutableRefObject<Webcam | null> | ((instance: Webcam | null) => void) | null | undefined
}

export default function Content({ isRevert, predictSign, webcamRef }: ContentProps) {
  const router = useRouter()
  const params = useSearchParams()
  let langParam = params.get('lang')
  let textParam = params.get('text')
  const { isListening, transcript, startListening, stopListening } = useSpeechToText({
    continuous: false,
    lang: langParam === 'en' ? 'en' : 'vi'
  })
  const [text, setText] = useState('')
  const [debounceText] = useDebounce(text, 1000)
  const [query, setQuery] = useState('')
  const [imgSrc, setImgSrc] = useState<string | null>(null)

  useEffect(() => {
    setText(transcript)
    if (transcript) router.push(`?lang=${langParam}&text=${transcript}`)
  }, [langParam, router, transcript])

  useEffect(() => {
    setQuery(encodeURIComponent(debounceText))
  }, [debounceText])

  useEffect(() => {
    if (textParam) setText(decodeURIComponent(textParam))
  }, [textParam])

  useEffect(() => {
    if (langParam === LANG_VI && debounceText) {
      translateText(debounceText, LANG_VI, LANG_EN).then(translatedText => {
        if (translatedText) {
          setQuery(encodeURIComponent(translatedText))
        }
      })
    }
  }, [debounceText, langParam])

  const startStopListening = () => {
    if (isListening) stopVoice()
    else {
      setText('')
      startListening()
    }
  }

  const stopVoice = () => {
    setText(prev => {
      const newText = prev + (transcript.length ? (prev.length ? ' ' : '') + transcript : '')
      return newText
    })
    stopListening()
  }

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newText = e.target.value
    if (newText.length <= 500) {
      setText(newText)
      router.push(newText ? `/?lang=${langParam}&text=${encodeURIComponent(newText)}` : `/?lang=${langParam}`)
    }
  }

  return (
    <Stack direction='row' spacing={1.5}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        {isRevert ? (
          <Box className={styles.webcamContainer}>
            {
              <Webcam
                ref={webcamRef}
                className={styles.webcam}
                audio={false}
                mirrored={true}
                // screenshotFormat='image/jpeg'
                videoConstraints={{
                  facingMode: 'user'
                }}
              />
            }
          </Box>
        ) : (
          <TextField
            multiline
            rows={14}
            fullWidth
            disabled={isListening}
            value={text}
            InputProps={{
              sx: {
                borderRadius: '12px',
                fontSize: '1.2rem'
              }
            }}
            onChange={handleTextChange}
          />
        )}
        <MicroAndCountText
          text={text}
          isRevert={isRevert}
          isListening={isListening}
          startStopListening={startStopListening}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          background: 'rgba(0,0,0, 0.1)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          width={isRevert ? '100%' : '74%'}
          height={isRevert ? '100%' : '90%'}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'space-between',
            alignContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            flexWrap: 'wrap'
          }}
        >
          {isRevert && predictSign && (
            <>
              <Typography sx={{ width: '100%', p: 1 }}>{predictSign}</Typography>
              <TextToAudio text={predictSign} />
            </>
          )}
          {imgSrc && <Image className={styles.imgResult} src={imgSrc!} fill={true} alt='Picture of the author' />}
          {query &&
            createElement('pose-viewer', {
              loop: true,
              src: `https://us-central1-sign-mt.cloudfunctions.net/spoken_text_to_signed_pose?text=${query}&spoken=en&signed=ase`
            })}
        </Box>
      </Box>
    </Stack>
  )
}
