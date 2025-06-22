export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { model, prompt } = req.body;

  let apiUrl, apiKey, body, headers;
  if (model === 'deepseek') {
    apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    apiKey = process.env.DEEPSEEK_KEY;
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    body = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一名专业的中文内容创作者。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4096
    });
  } else if (model === 'hunyuan') {
    apiUrl = 'https://hunyuan.tencentcloudapi.com/v1/chat/completions';
    apiKey = process.env.HUNYUAN_KEY;
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    body = JSON.stringify({
      model: 'hunyuan-chat',
      messages: [
        { role: 'system', content: '你是一名专业的中文内容创作者。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4096
    });
  } else {
    res.status(400).json({ error: 'Unsupported model' });
    return;
  }

  try {
    const response = await fetch(apiUrl, { method: 'POST', headers, body });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'API调用失败', detail: e.message });
  }
} 