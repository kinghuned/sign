import { Box } from '@mui/material'
import Content from '../components/content/content'
import LanguageList from '../components/language_list/language_list'
import OptionList from '../components/option_list/option_list'
import { Suspense } from 'react'

export default function Home() {
  const isRevert = false
  return (
    <Box>
      <OptionList isRevert={isRevert} />
      <Suspense>
        <LanguageList isRevert={isRevert} />
      </Suspense>
      <Suspense>
        <Content isRevert={isRevert} />
      </Suspense>
    </Box>
  )
}
