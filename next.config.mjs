/** @type {import('next').NextConfig} */
import path from 'path'

const __filename = import.meta.url.slice(7) // Remove the "file://" prefix
const __dirname = path.dirname(__filename)

const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: ''
      }
    ]
  }
}

export default nextConfig
