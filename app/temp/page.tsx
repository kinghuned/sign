'use client'
import { useState } from 'react'

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files ? event.target.files[0] : null)
  }

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('https://172.25.41.23:8000/audio-to-text', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Result:', result)
        console.log('File uploaded successfully')
      } else {
        console.error('Failed to upload file')
      }
    }
  }

  return (
    <div style={{ marginTop: 200 }}>
      <input type='file' onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}

export default UploadFile
