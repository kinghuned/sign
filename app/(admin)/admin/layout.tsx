import { Box, Container } from '@mui/material'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Container maxWidth='lg' sx={{ my: '100px' }}>
      {children}
    </Container>
  )
}
