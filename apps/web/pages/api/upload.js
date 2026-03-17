import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Configure upload directory
const uploadDir = path.join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Allowed file types for medical files
const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

const ALL_ALLOWED = [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.documents]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Parse multipart form data manually (Next.js 14 doesn't include built-in multipart parsing)
function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type']
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      reject(new Error('Invalid content type'))
      return
    }

    let body = Buffer.alloc(0)
    req.on('data', chunk => {
      body = Buffer.concat([body, chunk])
      if (body.length > MAX_FILE_SIZE) {
        reject(new Error('File too large'))
      }
    })

    req.on('end', () => {
      try {
        // Parse multipart boundary
        const boundaryMatch = contentType.match(/boundary=([^;]+)/)
        if (!boundaryMatch) {
          reject(new Error('No boundary found'))
          return
        }

        const boundary = boundaryMatch[1]
        const parts = body.toString('latin1').split(`--${boundary}`)
        
        const files = []
        const fields = {}

        for (let i = 1; i < parts.length - 1; i++) {
          const part = parts[i]
          if (!part.includes('Content-Disposition')) continue

          const headerEndIndex = part.indexOf('\r\n\r\n')
          if (headerEndIndex === -1) continue

          const headers = part.substring(0, headerEndIndex)
          const content = part.substring(headerEndIndex + 4, part.length - 2)

          // Parse Content-Disposition header
          const nameMatch = headers.match(/name="([^"]+)"/)
          const fileNameMatch = headers.match(/filename="([^"]+)"/)
          const contentTypeMatch = headers.match(/Content-Type: ([^\r\n]+)/)

          if (!nameMatch) continue

          const fieldName = nameMatch[1]

          if (fileNameMatch && contentTypeMatch) {
            // It's a file
            files.push({
              fieldName,
              fileName: fileNameMatch[1],
              mimeType: contentTypeMatch[1],
              content: Buffer.from(content, 'latin1')
            })
          } else {
            // It's a regular field
            fields[fieldName] = content.trim()
          }
        }

        resolve({ files, fields })
      } catch (err) {
        reject(err)
      }
    })

    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { files, fields } = await parseFormData(req)

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Validate file type
      if (!ALL_ALLOWED.includes(file.mimeType)) {
        return res.status(400).json({
          error: `File type ${file.mimeType} not allowed. Supported types: images (JPG, PNG, WebP, TIFF) and documents (PDF, TXT, DOC, DOCX)`
        })
      }

      // Validate file size
      if (file.content.length > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: `File size exceeds 10MB limit`
        })
      }

      // Generate unique filename
      const ext = path.extname(file.fileName)
      const uniqueName = `${randomUUID()}${ext}`
      const filePath = path.join(uploadDir, uniqueName)

      // Save file
      fs.writeFileSync(filePath, file.content)

      // Determine file type category
      const category = ALLOWED_TYPES.images.includes(file.mimeType) ? 'image' : 'document'

      // For images, include base64 so AI can actually see them
      // For text files, include the text content
      let base64Data = null
      let textContent = null

      if (category === 'image') {
        base64Data = file.content.toString('base64')
      } else if (file.mimeType === 'text/plain') {
        textContent = file.content.toString('utf-8').slice(0, 8000) // cap at 8k chars
      }

      uploadedFiles.push({
        id: uniqueName,
        originalName: file.fileName,
        fileName: uniqueName,
        mimeType: file.mimeType,
        size: file.content.length,
        category,
        url: `/uploads/${uniqueName}`,
        uploadedAt: new Date().toISOString(),
        base64Data,
        textContent,
      })
    }

    res.status(200).json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      error: error.message || 'File upload failed'
    })
  }
}
