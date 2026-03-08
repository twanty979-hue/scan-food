// hooks/usePaimaster.ts
import { useState, useRef } from 'react';
import { scanRetailProductAction } from '@/app/actions/PaimasterActions';

export function usePaimaster() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  
  // Ref สำหรับล็อคเป้าให้ปืนสแกนยิงเข้าช่องนี้เสมอ
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // ฟังก์ชันวิ่งไปค้นหาสินค้าจาก DB
  const scanProduct = async (barcode: string) => {
    return await scanRetailProductAction(barcode);
  };

  return {
    barcodeInput, 
    setBarcodeInput, 
    barcodeInputRef,
    isScanning, 
    setIsScanning, 
    scanProduct
  };
}