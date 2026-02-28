// app/actions/dashboardActions.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';
import 'dayjs/locale/th'; 
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Holidays from 'date-holidays';

dayjs.extend(utc);
dayjs.extend(timezone);

function getCountryFromTimezone(tz: string): string {
    if (!tz) return 'TH';
    const parts = tz.split('/');
    const city = parts[parts.length - 1]; // เอาตัวท้ายสุดชัวร์กว่า
    
    const tzMap: Record<string, string> = {
        'Bangkok': 'TH', 'Tokyo': 'JP', 'Seoul': 'KR', 'Shanghai': 'CN', 
        'Hong_Kong': 'HK', 'Singapore': 'SG', 'London': 'GB', 'Paris': 'FR', 
        'Berlin': 'DE', 'Dubai': 'AE', 'New_York': 'US', 'Los_Angeles': 'US', 
        'Chicago': 'US', 'Sydney': 'AU', 'Melbourne': 'AU', 'Manila': 'PH', 
        'Jakarta': 'ID', 'Ho_Chi_Minh': 'VN', 'Phnom_Penh': 'KH', 'Vientiane': 'LA',
        'Taipei': 'TW', 'Amsterdam': 'NL', 'Zurich': 'CH' // เพิ่มเมืองฝั่งยุโรป
    };
    return tzMap[city] || 'TH';
}

// 🔥 แก้ไขใหม่: ป้องกันบัคลูกค้าแบบ "ตลอดชีพ (Lifetime)"
// 🔥 แก้ไขใหม่: โหมดนายทุน! ป้องกันบัคเวลา และ ไม่มีวันหมดอายุ = เด้งไป Free ทันที
function calculateEffectivePlan(brand: any) {
    const now = dayjs();

    // 🛠️ ตัวช่วยแปลงเวลาให้ dayjs อ่านออก 100%
    const parseExpiry = (dateString: string | null) => {
        if (!dateString) return null;
        const safeDateStr = dateString.replace(' ', 'T'); 
        return dayjs(safeDateStr);
    };
    
    // ลำดับที่ 1: เช็กสถานะของ 'ultimate'
    if (brand.plan === 'ultimate') {
        const exp = parseExpiry(brand.expiry_ultimate);
        // ต้องมีวันหมดอายุ + แปลงค่าได้ + ยังไม่หมดเวลา เท่านั้นถึงจะรอด!
        if (exp && exp.isValid() && exp.isAfter(now)) return 'ultimate';
    }
    
    // ลำดับที่ 2: เช็กสถานะของ 'pro' 
    if (brand.plan === 'pro') {
        const exp = parseExpiry(brand.expiry_pro);
        if (exp && exp.isValid() && exp.isAfter(now)) return 'pro';
    }

    // ลำดับที่ 3: เช็กสถานะของ 'basic'
    if (brand.plan === 'basic') {
        const exp = parseExpiry(brand.expiry_basic);
        if (exp && exp.isValid() && exp.isAfter(now)) return 'basic';
    }

    // 🔥 โหมดไร้ความปรานี: 
    // - หมดอายุแล้ว -> Free!
    // - ไม่มีวันหมดอายุในระบบ (NULL) -> Free!
    // - ข้อมูลพังอ่านไม่ออก -> Free!
    return 'free'; 
}

export async function getDashboardDataAction(
    range: string = 'month',
    customFrom?: string, 
    customTo?: string
) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { cookies: { get(name) { return cookieStore.get(name)?.value } } }
    );

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: profile } = await supabase
            .from('profiles')
            .select('brand_id, brands(timezone, plan, expiry_basic, expiry_pro, expiry_ultimate)') 
            .eq('id', user.id)
            .single();
        
        if (!profile?.brand_id) throw new Error("No brand assigned");
        const brandId = profile.brand_id;
        
        const brand = Array.isArray(profile.brands) ? profile.brands[0] : profile.brands;
        const brandTimezone = brand?.timezone || 'Asia/Bangkok';
        
        const effectivePlan = calculateEffectivePlan(brand);

        const localCountryCode = getCountryFromTimezone(brandTimezone);
        const hdLocal = new Holidays(localCountryCode, 'en');
        const hdCN = new Holidays('CN', 'en'); // 👈 แก้ตรงนี้! เปลี่ยน 'SG' เป็น 'CN'
        const hdUS = new Holidays('US', 'en');

        let now = dayjs().tz(brandTimezone);
        let startDate: any = now;
        let endDate: any = now;
        let isAllTime = false;

        const anchorDate = customFrom ? dayjs.tz(customFrom, brandTimezone) : now;

        if (range === 'today') {
            startDate = anchorDate.startOf('day');
            endDate = anchorDate.endOf('day');
        } else if (range === 'month') {
            startDate = anchorDate.startOf('month');
            endDate = anchorDate.endOf('month');
        } else if (range === 'year') {
            startDate = anchorDate.startOf('year');
            endDate = anchorDate.endOf('year');
        } else if (range === 'custom') {
            if (customFrom) startDate = dayjs.tz(customFrom, brandTimezone).startOf('day');
            if (customTo) endDate = dayjs.tz(customTo, brandTimezone).endOf('day');
        } else if (range === 'all') {
            isAllTime = true;
        }

        // =========================================================
        // 🛡️ Limit Guard: 30 วันสำหรับ Free Plan
        // =========================================================
        let limitWarning = false;
        
        if (effectivePlan === 'free') {
            const limitDate = now.subtract(30, 'day').startOf('day'); 
            
            if (isAllTime) {
                isAllTime = false;
                startDate = limitDate;
                limitWarning = true;
            } else if (startDate.isBefore(limitDate)) {
                startDate = limitDate;
                if (endDate.isBefore(limitDate)) {
                    endDate = limitDate;
                }
                limitWarning = true;
            }
        }
        // =========================================================

        let salesQuery = supabase.from('dashboard_daily_sales').select('*').eq('brand_id', brandId).order('report_date', { ascending: true });
        if (!isAllTime) salesQuery = salesQuery.gte('report_date', startDate.format('YYYY-MM-DD')).lte('report_date', endDate.format('YYYY-MM-DD'));
        const { data: salesData, error: salesError } = await salesQuery;
        if (salesError) throw salesError;

        let prodQuery = supabase.from('dashboard_product_stats').select('product_name, total_quantity, total_revenue').eq('brand_id', brandId);
        if (!isAllTime) prodQuery = prodQuery.gte('report_date', startDate.format('YYYY-MM-DD')).lte('report_date', endDate.format('YYYY-MM-DD'));
        const { data: productStats, error: prodError } = await prodQuery;
        if (prodError) throw prodError;

        let processedTrend: { date: string; value: number; holiday?: string }[] = [];
        const parseDate = (dateStr: string) => dayjs.tz(dateStr, brandTimezone);

        const getHolidayName = (dateInput: string | Date) => { 
            const holidays: string[] = [];
            const d = dayjs.tz(dateInput, brandTimezone).toDate();
            const addHoliday = (type: string, name: string) => { if (!holidays.some(h => h.includes(name))) holidays.push(`${type}|${name}`); };

            const hLocal = hdLocal.isHoliday(d);
            if (hLocal) { const list = Array.isArray(hLocal) ? hLocal : [hLocal]; list.forEach((h: any) => addHoliday('local', h.name)); }

            const hCN = hdCN.isHoliday(d);
            if (hCN) { const list = Array.isArray(hCN) ? hCN : [hCN]; list.forEach((h: any) => { if (h.name.includes('Chinese New Year')) addHoliday('china', "Chinese New Year"); }); }

            const hUS = hdUS.isHoliday(d);
            if (hUS) { const list = Array.isArray(hUS) ? hUS : [hUS]; list.forEach((h: any) => { if (h.name.includes('Christmas') || h.name.includes('New Year') || h.name.includes('Thanksgiving')) addHoliday('global', h.name); }); }

            const month = d.getMonth() + 1; const day = d.getDate();
            if (month === 2 && day === 14) addHoliday('love', "Valentine's Day");
            if (month === 10 && day === 31) addHoliday('halloween', "Halloween");

            if (holidays.length > 0) return holidays[0]; 
            return null;
        };

        // 🔥 แก้ไขการวาดกราฟให้แม่นยำ ไม่สนว่าจะโดน Limit Guard หรือไม่
        if (range === 'year') {
            const requestedYearStart = anchorDate.startOf('year');
            processedTrend = Array.from({ length: 12 }, (_, i) => {
                const d = requestedYearStart.add(i, 'month');
                return { date: d.locale('th').format('MMM'), value: 0, holiday: undefined };
            });
            salesData?.forEach((item) => {
                const itemDate = parseDate(item.report_date);
                if (itemDate.year() === requestedYearStart.year()) {
                    const idx = itemDate.month();
                    if (processedTrend[idx]) processedTrend[idx].value += Number(item.total_revenue);
                }
            });

        } else if (range === 'month') {
            // 🚨 แก้บัคกราฟเดือนหาย: ใช้ anchorDate สร้างแกน X แทน startDate 
            const requestedMonthStart = anchorDate.startOf('month');
            const daysInMonth = requestedMonthStart.daysInMonth();
            
            processedTrend = Array.from({ length: daysInMonth }, (_, i) => {
                const d = requestedMonthStart.add(i, 'day');
                const dateStr = d.format('YYYY-MM-DD');
                return { date: d.format('D'), value: 0, holiday: getHolidayName(dateStr) || undefined };
            });
            
            salesData?.forEach((item) => {
                const itemDate = parseDate(item.report_date);
                if (itemDate.month() === requestedMonthStart.month() && itemDate.year() === requestedMonthStart.year()) {
                    const dayIdx = itemDate.date() - 1;
                    if (processedTrend[dayIdx]) processedTrend[dayIdx].value += Number(item.total_revenue);
                }
            });

        } else {
            processedTrend = salesData?.map(d => {
                return {
                    date: parseDate(d.report_date).locale('th').format('D MMM'), 
                    value: Number(d.total_revenue),
                    holiday: getHolidayName(d.report_date) || undefined 
                };
            }) || [];
            
            if (processedTrend.length === 0 && range === 'today') {
                const todayStr = anchorDate.format('YYYY-MM-DD');
                processedTrend = [{ date: 'วันนี้', value: 0, holiday: getHolidayName(todayStr) || undefined }];
            }
        }

        const summary = {
            totalRevenue: salesData?.reduce((sum, item) => sum + Number(item.total_revenue), 0) || 0,
            totalOrders: salesData?.reduce((sum, item) => sum + Number(item.total_orders), 0) || 0,
        };

        const productMap = new Map();
        productStats?.forEach((p) => {
            const current = productMap.get(p.product_name) || { qty: 0, revenue: 0 };
            productMap.set(p.product_name, {
                qty: current.qty + p.total_quantity,
                revenue: current.revenue + p.total_revenue
            });
        });

        const topProducts = Array.from(productMap.entries())
            .map(([name, val]) => ({ name, qty: (val as any).qty, revenue: (val as any).revenue }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        return { 
            success: true, 
            range, 
            summary, 
            salesTrend: processedTrend, 
            topProducts, 
            limitWarning 
        };

    } catch (error: any) {
        console.error("Dashboard Error:", error);
        return { success: false, error: error.message };
    }
}