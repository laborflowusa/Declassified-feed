exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let text;
  try {
    const body = JSON.parse(event.body);
    text = body.text || body.document || '';  // Support slight variations
  } catch(e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON in request body' }) };
  }

  if (!text || text.length < 50) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Document text too short. Paste at least 50 characters.' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'GROQ_API_KEY environment variable not set in Netlify' }) };
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
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    const rawText = data.choices[0].message.content.trim();

    // Robust JSON cleaning - fixes most "gibberish" cases
    let clean = rawText
      .replace(/```json|```/g, '')
      .replace(/^[\s\S]*?(\{[\s\S]*\})/, '$1')  // Extract first JSON object
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      // Extra fallback for malformed output
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI did not return valid JSON. Try a different document snippet.');
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };

  } catch(err) {
    console.error('Analysis error:', err);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: err.message || 'Analysis failed. Check document text and try again.' }) 
    };
  }
};
