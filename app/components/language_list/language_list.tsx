'use client'
import { ExpandLessRounded, SwapHorizRounded } from '@mui/icons-material'
import { TabContext, TabList } from '@mui/lab'
import { Box, IconButton, Stack, Tab } from '@mui/material'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation' // Use next/router instead of next/navigation
import { useEffect, useState } from 'react'

export interface LanguageListProps {
  isRevert: boolean
}

export default function LanguageList({ isRevert }: LanguageListProps) {
  const [value, setValue] = useState('1')
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const langParam = params.get('lang')
  const textParam = params.get('text')

  useEffect(() => {
    if (!langParam) {
      const url = `?lang=en${textParam ? `&text=${textParam}` : ''}`
      router.push(url)
      setValue('1')
    } else {
      setValue(langParam === 'en' ? '1' : '2')
    }
  }, [langParam, textParam]) // Add textParam to the dependency array

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    const lang = newValue === '1' ? 'en' : 'vi'
    const url = `?lang=${lang}${textParam ? `&text=${textParam}` : ''}`
    router.push(url)
    setValue(newValue)
    console.log(window.location.href)
  }

  const handleToggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <Stack direction={isRevert ? 'row-reverse' : 'row'} alignItems='center' mt={1.5} mx={1.5}>
      <Box flex='1'>
        <TabContext value={value}>
          <Box sx={{ display: 'inline-block' }}>
            <TabList onChange={handleChange}>
              <Tab label='English' value='1' />
              <Tab label='Vietnamese' value='2' />
            </TabList>
          </Box>
          <IconButton sx={{ ml: 1 }} onClick={handleToggleExpand}>
            <ExpandLessRounded
              sx={{ transition: '.1s ease all', rotate: 0, transform: expanded ? 0 : 'rotate(180deg)' }}
            />
          </IconButton>
        </TabContext>
      </Box>
      <Box>
        <Link href={isRevert ? '/' : '/sign-to-text'}>
          <IconButton>
            <SwapHorizRounded />
          </IconButton>
        </Link>
      </Box>
      <Box flex='1'>
        <TabContext value='1'>
          <Box>
            <TabList onChange={handleChange}>
              <Tab label='Sign language' value='1' />
            </TabList>
          </Box>
        </TabContext>
      </Box>
    </Stack>
  )
}
