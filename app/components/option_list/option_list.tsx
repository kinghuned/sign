// OptionList.tsx
import { TranslateRounded, UploadFile, VideocamOffRounded, VideocamRounded } from '@mui/icons-material'
import { Box, Button } from '@mui/material'
import colors from '../../constants.module.scss'

export interface OptionListProps {
  isRevert: boolean
  capturing?: boolean
  uploading?: boolean
  handleStartCaptureClick?: () => void
  handleStopCaptureClick?: () => void
  handleUpload?: () => void
  recordedChunks?: Blob[]
}

export default function OptionList({
  isRevert,
  capturing,
  uploading,
  handleStartCaptureClick,
  handleStopCaptureClick,
  handleUpload,
  recordedChunks
}: OptionListProps) {
  return (
    <Box pt={2}>
      {!isRevert && (
        <Button
          startIcon={<TranslateRounded />}
          variant='outlined'
          sx={{ background: colors.primaryColorActive, textTransform: 'none' }}
        >
          Text
        </Button>
      )}
      {isRevert && (
        <>
          <Button
            onClick={capturing ? handleStopCaptureClick : handleStartCaptureClick}
            startIcon={capturing ? <VideocamRounded /> : <VideocamOffRounded />}
            variant='outlined'
            sx={{ background: colors.primaryColorActive, textTransform: 'none' }}
          >
            {capturing ? 'Recording' : 'Record'}
          </Button>
          <Button
            onClick={handleUpload}
            startIcon={<UploadFile />}
            variant='outlined'
            sx={{ ml: 2, background: colors.primaryColorActive, textTransform: 'none' }}
            disabled={recordedChunks?.length === 0 || uploading || capturing ? true : false}
          >
            {uploading ? 'Uploading' : 'Upload'}
          </Button>
        </>
      )}
    </Box>
  )
}
