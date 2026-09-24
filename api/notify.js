// api/notify.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { botToken, userIds, message } = req.body;

  if (!botToken || !userIds || !Array.isArray(userIds) || !message) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const results = await Promise.all(
    userIds.map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
          })
        });
        return response.json();
      } catch (err) {
        return { error: err.message };
      }
    })
  );

  return res.status(200).json({ success: true, results });
}