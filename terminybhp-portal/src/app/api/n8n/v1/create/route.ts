import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // Prosta weryfikacja klucza API z nagłówka (możesz skonfigurować w n8n)
    const authHeader = req.headers.get('authorization');
    const EXPECTED_TOKEN = process.env.N8N_API_TOKEN || 'SecretN8NToken123';

    if (authHeader !== `Bearer ${EXPECTED_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Spodziewamy się formatu podobnego do /wp-json/wp/v2/posts
    // np. { title: "Tytuł", content: "Treść...", slug: "tytul", status: "publish" }
    const { title, content, slug, status } = body;

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, or slug' },
        { status: 400 }
      );
    }

    const postData = {
      title,
      slug,
      content,
      status: status || 'publish',
      createdAt: new Date().toISOString(),
    };

    const fileName = `${slug}.json`;
    const postsDir = path.join(process.cwd(), 'data', 'posts');
    const filePath = path.join(postsDir, fileName);

    // Zapisujemy jako JSON
    fs.writeFileSync(filePath, JSON.stringify(postData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      id: slug, // używamy slug jako ID
      slug: slug,
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
