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
    if (tz.includes('Bangkok')) return 'TH';
    if (tz.includes('Tokyo')) return 'JP';
    if (tz.includes('Seoul')) return 'KR';
    if (tz.includes('Shanghai') || tz.includes('Hong_Kong')) return 'CN';
    if (tz.includes('Singapore')) return 'SG';
    if (tz.includes('London')) return 'GB';
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) return 'US';
    if (tz.includes('Sydney') || tz.includes('Melbourne')) return 'AU';
    return 'TH';
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
            .select('brand_id, brands(timezone)') 
            .eq('id', user.id)
            .single();
        
        if (!profile?.brand_id) throw new Error("No brand assigned");
        const brandId = profile.brand_id;
        const brandTimezone = profile.brands?.[0]?.timezone || 'Asia/Bangkok';

        const localCountryCode = getCountryFromTimezone(brandTimezone);
        
        const hdLocal = new Holidays(localCountryCode, 'en');
        const hdCN = new Holidays('SG', 'en'); // ใช้ SG แทนจีนเพื่อให้ได้วันหยุดจีนแบบสากล (หรือใช้ CN ก็ได้)
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

        let salesQuery = supabase.from('dashboard_daily_sales').select('*').eq('brand_id', brandId).order('report_date', { ascending: true });
        if (!isAllTime) salesQuery = salesQuery.gte('report_date', startDate.format('YYYY-MM-DD')).lte('report_date', endDate.format('YYYY-MM-DD'));
        const { data: salesData, error: salesError } = await salesQuery;
        if (salesError) throw salesError;

        let prodQuery = supabase.from('dashboard_product_stats').select('product_name, total_quantity, total_revenue').eq('brand_id', brandId);
        if (!isAllTime) prodQuery = prodQuery.gte('report_date', startDate.format('YYYY-MM-DD')).lte('report_date', endDate.format('YYYY-MM-DD'));
        const { data: productStats, error: prodError } = await prodQuery;
        if (prodError) throw prodError;

        // --- Process Data ---
        let processedTrend: { date: string; value: number; holiday?: string }[] = [];
        const parseDate = (dateStr: string) => dayjs.tz(dateStr, brandTimezone);

        // ✅ ฟังก์ชันคำนวณวันหยุด (Logic เดิมของคุณ ถูกต้องแล้ว)
        const getHolidayName = (dateInput: string | Date) => { 
            const holidays: string[] = [];
            const d = dayjs(dateInput).toDate(); 

            const addHoliday = (type: string, name: string) => {
                if (!holidays.some(h => h.includes(name))) {
                    holidays.push(`${type}|${name}`);
                }
            };

            const hLocal = hdLocal.isHoliday(d);
            if (hLocal) {
                const list = Array.isArray(hLocal) ? hLocal : [hLocal];
                list.forEach((h: any) => addHoliday('local', h.name));
            }

            const hCN = hdCN.isHoliday(d);
            if (hCN) {
                const list = Array.isArray(hCN) ? hCN : [hCN];
                list.forEach((h: any) => {
                    if (h.name.includes('Chinese New Year')) {
                        addHoliday('china', "Chinese New Year");
                    }
                });
            }

            const hUS = hdUS.isHoliday(d);
            if (hUS) {
                const list = Array.isArray(hUS) ? hUS : [hUS];
                list.forEach((h: any) => {
                    if (
                        h.name.includes('Christmas') || 
                        h.name.includes('New Year') ||
                        h.name.includes('Thanksgiving')
                    ) {
                        addHoliday('global', h.name);
                    }
                });
            }

            const month = d.getMonth() + 1;
            const day = d.getDate();
            if (month === 2 && day === 14) addHoliday('love', "Valentine's Day");
            if (month === 10 && day === 31) addHoliday('halloween', "Halloween");

            if (holidays.length > 0) {
                return holidays[0]; 
            }
            return null;
        };

        if (range === 'year') {
            // รายปี: ปกติไม่แสดงวันหยุดรายวันเพราะสเกลเป็นเดือน
            processedTrend = Array.from({ length: 12 }, (_, i) => {
                const d = startDate.month(i).startOf('month');
                return {
                    date: d.locale('th').format('MMM'), 
                    value: 0, 
                    holiday: undefined 
                };
            });
            salesData?.forEach((item) => {
                const itemDate = parseDate(item.report_date);
                if (itemDate.year() === startDate.year()) {
                    const idx = itemDate.month();
                    if (processedTrend[idx]) processedTrend[idx].value += Number(item.total_revenue);
                }
            });

        } else if (range === 'month') {
            // ✅ รายเดือน: แก้ไขจุดนี้ ให้เรียก getHolidayName
            const daysInMonth = startDate.daysInMonth();
            processedTrend = Array.from({ length: daysInMonth }, (_, i) => {
                const d = startDate.date(i + 1);
                const dateStr = d.format('YYYY-MM-DD');
                
                return {
                    date: d.format('D'), 
                    value: 0, 
                    // ✅ เรียกใช้ฟังก์ชันที่นี่ครับ
                    holiday: getHolidayName(dateStr) || undefined 
                };
            });
            salesData?.forEach((item) => {
                const itemDate = parseDate(item.report_date);
                if (itemDate.month() === startDate.month() && itemDate.year() === startDate.year()) {
                    const dayIdx = itemDate.date() - 1;
                    if (processedTrend[dayIdx]) processedTrend[dayIdx].value += Number(item.total_revenue);
                }
            });

        } else {
            // Custom Range / Today / All Time
            // ใช้ map จาก salesData โดยตรง แต่อาจขาดวันที่ที่ยอดขายเป็น 0
            // ถ้าอยากให้ครบทุกวัน ต้องทำ Loop เหมือน 'month' แต่เปลี่ยน range
            
            // กรณีนี้ใช้ข้อมูลที่มีไปก่อน
            processedTrend = salesData?.map(d => {
                return {
                    date: parseDate(d.report_date).locale('th').format('D MMM'), 
                    value: Number(d.total_revenue),
                    holiday: getHolidayName(d.report_date) || undefined 
                };
            }) || [];
            
            if (processedTrend.length === 0 && range === 'today') {
                const todayStr = now.format('YYYY-MM-DD');
                processedTrend = [{ 
                    date: 'วันนี้', 
                    value: 0, 
                    holiday: getHolidayName(todayStr) || undefined 
                }];
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

        return { success: true, range, summary, salesTrend: processedTrend, topProducts };

    } catch (error: any) {
        console.error("Dashboard Error:", error);
        return { success: false, error: error.message };
    }
}