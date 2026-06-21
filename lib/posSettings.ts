'use client';

import { db } from '@/lib/db';

export interface PosDisplaySettings {
  showProductImages: boolean;
  hideProductNames: boolean;
  autoPrintReceipt: boolean;
  autoPrintOrders: boolean;
  receiptCopies: 1 | 2;
}

export const POS_SETTINGS_KEY = 'foodscan_pos_settings';

export const DEFAULT_POS_SETTINGS: PosDisplaySettings = {
  showProductImages: false,
  hideProductNames: false,
  autoPrintReceipt: true,
  autoPrintOrders: false,
  receiptCopies: 1,
};

function normalizeSettings(value?: Partial<PosDisplaySettings> | null): PosDisplaySettings {
  return {
    showProductImages: value?.showProductImages ?? DEFAULT_POS_SETTINGS.showProductImages,
    hideProductNames: value?.hideProductNames ?? DEFAULT_POS_SETTINGS.hideProductNames,
    autoPrintReceipt: value?.autoPrintReceipt ?? DEFAULT_POS_SETTINGS.autoPrintReceipt,
    autoPrintOrders: value?.autoPrintOrders ?? DEFAULT_POS_SETTINGS.autoPrintOrders,
    receiptCopies: value?.receiptCopies === 2 ? 2 : 1,
  };
}

function syncSettingsToAndroid(settings: PosDisplaySettings) {
  if (typeof window === 'undefined') return;
  const bridge = (window as any).AndroidBridge;
  if (typeof bridge?.configurePrintSettings === 'function') {
    bridge.configurePrintSettings(JSON.stringify({
      receiptCopies: settings.receiptCopies,
      autoPrintOrders: settings.autoPrintOrders,
    }));
  }
}

export function getPosSettings(): PosDisplaySettings {
  if (typeof window === 'undefined') return DEFAULT_POS_SETTINGS;

  try {
    const saved = window.localStorage.getItem(POS_SETTINGS_KEY);
    if (!saved) return DEFAULT_POS_SETTINGS;
    const parsed = JSON.parse(saved) as Partial<PosDisplaySettings>;
    return normalizeSettings(parsed);
  } catch {
    return DEFAULT_POS_SETTINGS;
  }
}

export async function loadPosSettings(): Promise<PosDisplaySettings> {
  if (typeof window === 'undefined') return DEFAULT_POS_SETTINGS;

  try {
    const stored = await db.app_settings.get(POS_SETTINGS_KEY);
    if (stored?.value) {
      const settings = normalizeSettings(stored.value as Partial<PosDisplaySettings>);
      window.localStorage.setItem(POS_SETTINGS_KEY, JSON.stringify(settings));
      syncSettingsToAndroid(settings);
      return settings;
    }
  } catch (error) {
    console.warn('Unable to read POS settings from IndexedDB', error);
  }

  const fallback = getPosSettings();
  syncSettingsToAndroid(fallback);
  await persistToIndexedDb(fallback);
  return fallback;
}

async function persistToIndexedDb(settings: PosDisplaySettings) {
  try {
    await db.app_settings.put({
      key: POS_SETTINGS_KEY,
      value: settings,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Unable to save POS settings to IndexedDB', error);
  }
}

export async function savePosSettings(settings: PosDisplaySettings) {
  window.localStorage.setItem(POS_SETTINGS_KEY, JSON.stringify(settings));
  window.localStorage.setItem('auto_kitchen_enabled', String(settings.autoPrintOrders));
  window.dispatchEvent(new CustomEvent('foodscan:pos-settings', { detail: settings }));
  syncSettingsToAndroid(settings);
  await persistToIndexedDb(settings);
}
