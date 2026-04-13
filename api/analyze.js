export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || text.length < 50) {
    return res.status(400).json({ error: 'Document text too short' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompt = `You are an expert intelligence analyst and investigative journalist specializing in classified government documents. Read the following declassified document and extract the 8-10 most shocking, mind-blowing, disturbing, or historically significant revelations.

For each finding, produce a Twitter/X-style post (max 280 characters) that captures the MOST jaw-dropping aspect. Make them punchy, impactful, bombshell revelations.

Detect: source agency (CIA, FBI, NSA, DOD, etc.), approximate time period, and classify each finding's shock level as: CRITICAL, HIGH, or NOTABLE.
Pick an appropriate emoji avatar for each account.

RULES:
- Be factual and grounded in the actual document text
- If non-governmental text is provided, extract the most interesting points anyway
- Write handle names like @CIA_Archive_1963, @FBIFile_COINTELPRO, @PentagonLeak etc.
- Lead with the bombshell, not context
- Highlight 1-3 key words per tweet by wrapping in <mark> tags

Return ONLY valid JSON (no markdown, no backticks, no preamble):
{
  "source_agency": "CIA",
  "time_period": "1963-1967",
  "classification_level": "TOP SECRET",
  "findings": [
    {
      "id": 1,
      "handle": "@CIA_1963",
      "avatar": "🕵️",
      "tweet": "Tweet text with <mark>highlighted</mark> words",
      "shock_level": "CRITICAL",
      "timestamp": "declassified 2017"
    }
  ]
}

DOCUMENT:
---
${text.substring(0, 12000)}
---`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const rawText = data.choices[0].message.content.trim();
    const clean = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Groq API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
