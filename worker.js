import Anthropic from '@anthropic-ai/sdk'

export default {
  async fetch(request, env, ctx) {
    const allowedOrigin = 'https://jpatp.github.io'
    const origin = request.headers.get('Origin')

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin === allowedOrigin ? allowedOrigin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }

    // Handle preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    try {
      const anthropic = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      })

      const messages = await request.json()

      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 300,
        system: 'You are a text summarizer. When asked to summarize a text, send back the summary of it. Please only send back the summary without prefixing it with things like "Summary" or telling where the text is from. Also give me the summary as if the original author wrote it and without using a third person voice.',
        messages,
      })

      return new Response(JSON.stringify({ summary: response.content[0].text }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }
  },
}
