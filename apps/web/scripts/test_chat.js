// Simple test script to POST a chat message to the local Next.js API
// Run with: node scripts/test_chat.js

const url = process.env.CHAT_URL || 'http://localhost:3000/api/chat'

async function run() {
  const payload = {
    sessionId: 'test-session-1',
    message: 'Hello — this is a test. I have a persistent cough and mild fever.',
    action: 'general',
    patientInfo: { name: 'Test User', age: 35, sex: 'F' }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    console.log('Status:', res.status)
    console.log('Response:', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Request failed:', err)
  }
}

run()
