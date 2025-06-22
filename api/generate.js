export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { model, prompt } = req.body;

  let apiUrl, apiKey, body, headers;
  if (model === 'deepseek') {
    apiUrl = 'https://api.deepseek.com/chat/completions';
    apiKey = process.env.DEEPSEEK_KEY;
    console.log('DEEPSEEK_KEY:', apiKey);
    if (!apiKey) {
      console.error('DEEPSEEK_KEY not set in environment variables');
      res.status(500).json({ error: 'DEEPSEEK_KEY not set in environment variables' });
      return;
    }
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`.trim(),
    };
    body = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一名专业的中文内容创作者。' },
        { role: 'user', content: prompt }
      ],
      stream: false
    });
  } else if (model === 'hunyuan') {
    apiUrl = 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions';
    apiKey = process.env.HUNYUAN_KEY;
    console.log('HUNYUAN_KEY:', apiKey);
    if (!apiKey) {
      console.error('HUNYUAN_KEY not set in environment variables');
      res.status(500).json({ error: 'HUNYUAN_KEY not set in environment variables' });
      return;
    }
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`.trim(),
    };
    body = JSON.stringify({
      model: 'hunyuan-turbos-latest',
      messages: [
        { role: 'system', content: '你是一名专业的中文内容创作者。' },
        { role: 'user', content: prompt }
      ],
      enable_enhancement: true
    });
  } else {
    console.error('Unsupported model:', model);
    res.status(400).json({ error: 'Unsupported model' });
    return;
  }

  try {
    console.log('Requesting:', { apiUrl, hasApiKey: !!apiKey, headers, body });
    const response = await fetch(apiUrl, { method: 'POST', headers, body });
    const text = await response.text();
    console.log('API response:', text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse API response as JSON:', text);
      res.status(500).json({ error: 'API返回非JSON', detail: text });
      return;
    }
    res.status(200).json(data);
  } catch (e) {
    console.error('API调用失败:', e);
    res.status(500).json({ error: 'API调用失败', detail: e.message });
  }
} 