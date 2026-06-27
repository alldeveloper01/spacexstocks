export async function pushover(title, message) {
  try {
    await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: process.env.PUSHOVER_APP_TOKEN,
        user: process.env.PUSHOVER_USER_KEY,
        title,
        message,
      }),
    })
  } catch (e) {
    console.error('Pushover error:', e)
  }
}
