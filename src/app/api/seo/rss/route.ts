import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest';
    const articles = await Article.find({ status: 'published' })
      .populate('author', 'name')
      .populate('category', 'name')
      .sort({ publishedAt: -1 })
      .limit(20)
      .select('title slug excerpt publishedAt author category')
      .lean() as any[];

    const items = articles.map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${site}/blog/${a.slug}</link>
      <guid isPermaLink="true">${site}/blog/${a.slug}</guid>
      <description><![CDATA[${a.excerpt || ''}]]></description>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      ${a.author ? `<author>${a.author.name}</author>` : ''}
      ${a.category ? `<category><![CDATA[${a.category.name}]]></category>` : ''}
    </item>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Vyom – Your Tech Universe</title>
    <link>${site}</link>
    <description>Latest tech news, reviews, and insights from Vyom</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${site}/og-image.png</url>
      <title>Vyom</title>
      <link>${site}</link>
    </image>${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
