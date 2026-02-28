// app/api/upload/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// 1. ตั้งค่า S3 Client โดยใช้ค่าจาก .env ของนาย
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    // 2. รับไฟล์และชื่อโฟลเดอร์ (Brand ID) จากหน้าบ้าน
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string; // 👈 จุดสำคัญ: รับ Brand ID

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // 3. แปลงไฟล์เป็น Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 4. ตั้งชื่อไฟล์ใหม่ให้ไม่ซ้ำกัน
    const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    // 🌟 5. รวมร่าง Path: ถ้าระบุ folder มาให้ใส่ "folder/filename" ถ้าไม่ระบุก็วางไว้หน้าแรก
    const fileKey = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

    // 6. อัปโหลดขึ้น Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey, // 👈 ใช้ fileKey ที่มีชื่อโฟลเดอร์นำหน้าแล้ว
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // 7. ส่งชื่อไฟล์พร้อม Path ย้อนกลับไปให้หน้าบ้าน
    return NextResponse.json({ 
      success: true, 
      fileName: fileKey, // ส่ง Path เต็มกลับไป (เช่น "B123/177203.webp")
      url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileKey}`
    });

  } catch (error) {
    console.error("Error uploading to R2:", error);
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}