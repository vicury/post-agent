import OpenAI from "openai";
import HunyuanClientModule from "tencentcloud-sdk-nodejs/tencentcloud/services/hunyuan/v20230901/hunyuan_client";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { model, prompt } = req.body;

  if (model === 'deepseek') {
    const apiKey = process.env.DEEPSEEK_KEY;
    if (!apiKey) {
      console.error('DEEPSEEK_KEY not set in environment variables');
      res.status(500).json({ error: 'DEEPSEEK_KEY not set in environment variables' });
      return;
    }
    const url = 'https://api.deepseek.com/v1/chat/completions';
    try {
      const response = await axios.post(
        url,
        {
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "你是一名专业的中文内容创作者。" },
            { role: "user", content: prompt }
          ],
          stream: false,
          max_tokens: 2048,
          temperature: 0.7
        },
        {
          headers: {
            // 'Authorization': `Bearer ${apiKey.trim()}`, // 如需兼容旧版可取消注释
            'apikey': apiKey.trim(), // DeepSeek 新版推荐
            'Content-Type': 'application/json'
          }
        }
      );
      res.status(200).json(response.data);
    } catch (e) {
      console.error('DeepSeek API调用失败:', e.response?.data || e.message);
      res.status(500).json({ error: 'DeepSeek API调用失败', detail: e.response?.data || e.message });
    }
    return;
  } else if (model === 'hunyuan') {
    // 腾讯混元官方SDK调用
    const SecretId = process.env.HUNYUAN_SECRET_ID;
    const SecretKey = process.env.HUNYUAN_SECRET_KEY;
    if (!SecretId || !SecretKey) {
      console.error('HUNYUAN_SECRET_ID or HUNYUAN_SECRET_KEY not set in environment variables');
      res.status(500).json({ error: 'HUNYUAN_SECRET_ID or HUNYUAN_SECRET_KEY not set in environment variables' });
      return;
    }
    const HunyuanClient = HunyuanClientModule.Client;
    const client = new HunyuanClient({
      credential: {
        secretId: SecretId,
        secretKey: SecretKey,
      },
      region: "ap-guangzhou",
      profile: {
        httpProfile: {
          endpoint: "hunyuan.tencentcloudapi.com",
        },
      },
    });
    const params = {
      TopP: 1,
      Temperature: 1,
      Model: "hunyuan-turbo",
      Stream: false,
      Messages: [
        { Role: "system", Content: "你是一名专业的中文内容创作者。" },
        { Role: "user", Content: prompt }
      ]
    };
    try {
      const data = await client.ChatCompletions(params);
      res.status(200).json(data);
    } catch (e) {
      console.error('Hunyuan API调用失败:', e);
      res.status(500).json({ error: 'Hunyuan API调用失败', detail: e.message });
    }
    return;
  } else {
    console.error('Unsupported model:', model);
    res.status(400).json({ error: 'Unsupported model' });
    return;
  }
} 