// hooks/usePrinter.ts
'use client';
import { useState, useEffect } from 'react';

export interface PrinterSettings {
  id: string;
  name: string;
  ipAddress: string;
  port: string;
  connectionType: 'airprint' | 'network_ip' | 'bluetooth';
  bluetoothAddress?: string;
  paperSize: '58mm' | '80mm';
  isDefault: boolean;
}

export function usePrinter() {
  const [printers, setPrinters] = useState<PrinterSettings[]>([]);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลเครื่องพิมพ์จากหน่วยความจำในเครื่อง iPad
  useEffect(() => {
    const savedPrinters = localStorage.getItem('foodscan_printers');
    if (savedPrinters) {
      setPrinters(JSON.parse(savedPrinters));
    }
    setLoading(false);
  }, []);

  // บันทึกข้อมูลลงเครื่อง
  const savePrinters = (newPrinters: PrinterSettings[]) => {
    setPrinters(newPrinters);
    localStorage.setItem('foodscan_printers', JSON.stringify(newPrinters));
    const defaultPrinter = newPrinters.find(printer => printer.isDefault) || newPrinters[0];
    if (defaultPrinter && typeof (window as any).AndroidBridge?.configurePrinter === 'function') {
      (window as any).AndroidBridge.configurePrinter(JSON.stringify(defaultPrinter));
    }
  };

  // เพิ่มหรืออัปเดตเครื่องพิมพ์
  const addOrUpdatePrinter = (printer: PrinterSettings) => {
    let updated = [...printers];
    
    // ถ้าตั้งค่าเป็นเครื่องหลัก ให้เคลียร์เครื่องอื่นก่อน
    if (printer.isDefault) {
      updated = updated.map(p => ({ ...p, isDefault: false }));
    }

    const index = printers.findIndex(p => p.id === printer.id);
    if (index >= 0) {
      updated[index] = printer;
    } else {
      updated.push(printer);
    }
    savePrinters(updated);
  };

  // ลบเครื่องพิมพ์
  const deletePrinter = (id: string) => {
    const updated = printers.filter(p => p.id !== id);
    savePrinters(updated);
  };

  return { printers, loading, addOrUpdatePrinter, deletePrinter };
}
