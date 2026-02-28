// app/api/delete-image/route.ts
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

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
    const { fileName } = await request.json(); 

    if (!fileName) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 });
    }

    // 🛡️ [SAFETY GUARD]: อัปเกรดเกราะป้องกันให้ครอบคลุม Master Assets และ Themes
    const protectedPaths = ["B1/", "system/", "master_assets/", "themes/"];
    
    // เช็กว่า fileName มีคำเหล่านี้อยู่ข้างหน้าหรือไม่
    const isProtected = protectedPaths.some(path => fileName.startsWith(path));

    if (isProtected) {
      console.log(`🛡️ Deletion Blocked (Safe): ${fileName} is a shared asset.`);
      return NextResponse.json({ 
        success: true, 
        message: "Protected asset: File preserved in R2 storage." 
      }); 
    }

    // 🗑️ [ACTUAL DELETE]: ลบเฉพาะรูปที่เป็นของร้านค้า (ไม่มีคำหวงห้าม)
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
    });

    await s3Client.send(command);
    
    console.log(`🗑️ Successfully deleted: ${fileName}`);
    return NextResponse.json({ success: true, deleted: fileName });

  } catch (error) {
    console.error("❌ Error deleting from R2:", error);
    return NextResponse.json({ error: "Internal Server Error during deletion" }, { status: 500 });
  }
}