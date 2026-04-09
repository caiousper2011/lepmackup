const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lpmakeup.com.br";

export async function GET() {
  const robotsTxt = `# L&PMakeUp - Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /checkout
Disallow: /minha-conta/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# AI Bots - Allowed for AI search visibility
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /
`;

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
