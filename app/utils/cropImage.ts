// utils/cropImage.ts

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    // ป้องกันปัญหา Cross-Origin เวลาดึงรูป
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * ฟังก์ชันสำหรับตัดรูปภาพ (Crop) และคืนค่าออกมาเป็น URL (Blob) 
 * เพื่อนำไปใช้อัปโหลดขึ้น Supabase ต่อไป
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // ตั้งค่าขนาด Canvas ให้เท่ากับรูปภาพต้นฉบับ
  canvas.width = image.width;
  canvas.height = image.height;

  ctx.translate(image.width / 2, image.height / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-image.width / 2, -image.height / 2);

  // วาดรูปลงบน Canvas
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('No 2d context');
  }

  // ตั้งค่าขนาด Canvas ใหม่ให้เท่ากับขนาดที่ถูก Crop
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // วาดเฉพาะส่วนที่ถูก Crop ลงไป
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // คืนค่าเป็น Blob URL เพื่อง่ายต่อการนำไปใช้งานต่อ
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((file) => {
      if (file) {
        resolve(URL.createObjectURL(file));
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.9); // 0.9 คือคุณภาพของรูป (90%)
  });
}