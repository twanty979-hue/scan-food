import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const MAX_LOGO_SIZE = 5 * 1024 * 1024;
function detectImageType(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { contentType: 'image/jpeg', extension: 'jpg' };
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { contentType: 'image/png', extension: 'png' };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { contentType: 'image/webp', extension: 'webp' };
  }
  return null;
}

function getLegacyLogoKey(logoUrl: string | null | undefined, brandId: string) {
  if (!logoUrl) return null;
  try {
    const key = decodeURIComponent(new URL(logoUrl).pathname.replace(/^\/+/, ''));
    const escapedBrandId = brandId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escapedBrandId}/logo-\\d+\\.(?:jpg|png|webp)$`).test(key)
      ? key
      : null;
  } catch {
    return null;
  }
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader || '' } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('brand_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.brand_id || profile.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Owners only' },
        { status: 403, headers: corsHeaders },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No logo file received' },
        { status: 400, headers: corsHeaders },
      );
    }
    if (file.size <= 0 || file.size > MAX_LOGO_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Logo image must not exceed 5 MB' },
        { status: 413, headers: corsHeaders },
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const imageType = detectImageType(fileBuffer);
    if (!imageType || imageType.contentType !== 'image/webp') {
      return NextResponse.json(
        { success: false, error: 'Brand logos must be uploaded as WebP' },
        { status: 415, headers: corsHeaders },
      );
    }

    const brandId = profile.brand_id as string;
    const { data: currentBrand } = await supabase
      .from('brands')
      .select('logo_url')
      .eq('id', brandId)
      .single();
    const legacyLogoKey = getLegacyLogoKey(currentBrand?.logo_url, brandId);

    const fileKey = `${brandId}/logo.webp`;
    const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, '');
    if (!publicBaseUrl || !process.env.R2_BUCKET_NAME) {
      throw new Error('R2 storage is not configured');
    }

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: imageType.contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    const logoUrl = `${publicBaseUrl}/${fileKey}?v=${Date.now()}`;
    const { error: updateError } = await supabase
      .from('brands')
      .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
      .eq('id', brandId);
    if (updateError) throw updateError;

    if (legacyLogoKey && legacyLogoKey !== fileKey) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: legacyLogoKey,
          }),
        );
      } catch (cleanupError) {
        console.warn('Unable to remove legacy brand logo:', cleanupError);
      }
    }

    return NextResponse.json(
      { success: true, logo_url: logoUrl },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error updating brand logo:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update brand logo' },
      { status: 500, headers: corsHeaders },
    );
  }
}
