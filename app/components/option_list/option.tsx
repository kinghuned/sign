'use client'
import { Button } from '@mui/material'
import { ReactNode, useState } from 'react'
import colors from '../../constants.module.scss'

export interface OptionProps {
  text: string
  icon: ReactNode
  toggleWebcam: () => void
}

export default function Option({ text, icon, toggleWebcam }: OptionProps) {
  const [isOpenCam, setIsOpenCam] = useState(false)

  return (
    <Button onClick={toggleWebcam} startIcon={icon} variant='outlined' sx={{ background: colors.primaryColorActive }}>
      {text}
    </Button>
  )
}
