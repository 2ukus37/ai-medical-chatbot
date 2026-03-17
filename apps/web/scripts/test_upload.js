const http = require('http')

const fileContent = 'Test medical report content - lab results normal'
const boundary = '----FormBoundary' + Math.random().toString(36).substr(2)

const CRLF = '\r\n'
const body = [
  '--' + boundary,
  'Content-Disposition: form-data; name="file"; filename="lab-report.txt"',
  'Content-Type: text/plain',
  '',
  fileContent,
  '--' + boundary + '--',
  ''
].join(CRLF)

const bodyBuffer = Buffer.from(body)

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': bodyBuffer.length
  }
}, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    console.log('Response:', JSON.stringify(JSON.parse(data), null, 2))
  })
})

req.on('error', e => console.log('Error:', e.message))
req.write(bodyBuffer)
req.end()
