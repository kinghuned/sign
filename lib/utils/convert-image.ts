const dataURLtoFile = (dataURL: string, filename: string) => {
  const arr = dataURL.split(',')
  if (arr.length < 2) {
    throw new Error('Invalid data URL')
  }

  const mimeMatch = arr[0].match(/:(.*?);/)
  if (!mimeMatch) {
    throw new Error('Invalid mime type')
  }
  const mime = mimeMatch[1]

  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export { dataURLtoFile }
