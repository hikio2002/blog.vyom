import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Article } from '@/lib/models';
import { requireAuth } from '@/lib/auth';
import { makeSlug, calcReadingTime, generateExcerpt } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(50, Number(searchParams.get('limit') || 10));
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || '-publishedAt';
    const admin = searchParams.get('admin') === 'true';

    const filter: any = {};
    // Public callers only see published
    if (!admin) filter.status = 'published';
    else if (status) filter.status = status;

    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('category', 'name slug')
        .populate('author', 'name avatar slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-content -revisions')
        .lean(),
      Article.countDocuments(filter),
    ]);

    return NextResponse.json({ articles, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const body = await req.json();

    const slug = body.slug || makeSlug(body.title);
    const exists = await Article.findOne({ slug });
    if (exists) return NextResponse.json({ error: 'Slug already exists. Choose a different title or edit the slug.' }, { status: 409 });

    const excerpt = body.excerpt || generateExcerpt(body.content);
    const readingTime = calcReadingTime(body.content);
    const metaTitle = body.metaTitle || body.title;
    const metaDescription = body.metaDescription || excerpt;
    const seoKeywords = body.seoKeywords?.length ? body.seoKeywords : (body.tags || []);
    const publishedAt = body.status === 'published' ? new Date() : body.publishedAt || undefined;

    const article = await Article.create({
      ...body, slug, excerpt, readingTime, metaTitle, metaDescription, seoKeywords, publishedAt,
    });
    return NextResponse.json(article, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
