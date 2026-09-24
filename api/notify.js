// api/notify.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { botToken, userIds, message } = req.body;

  if (!botToken || !userIds || !Array.isArray(userIds) || !message) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const cleanIds = Array.from(new Set(userIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0)));

  const deliveryReport = await Promise.all(
    cleanIds.map(async (chatId) => {
      try {
        const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
          })
        });
        const result = await resp.json();
        return { chatId, ok: result.ok, description: result.description || 'Delivered' };
      } catch (err) {
        return { chatId, ok: false, error: err.message };
      }
    })
  );

  return res.status(200).json({ success: true, report: deliveryReport });
}
