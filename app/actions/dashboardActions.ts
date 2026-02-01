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

// ✅ ฟังก์ชันช่วยแปลง Timezone เป็นรหัสประเทศ (ISO Code)
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
        
        // เตรียมสมุดวันหยุด 3 เล่ม
        const hdLocal = new Holidays(localCountryCode, 'en');
        const hdCN = new Holidays('SG', 'en');
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

        // Query ข้อมูล
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

        // ✅ แก้ไข: ฟังก์ชันรวมวันหยุด ส่งเป็น "รหัสประเภท|ชื่อวันหยุด"
        const getHolidayName = (dateInput: string | Date) => { 
            const holidays: string[] = [];
            const d = dayjs(dateInput).toDate(); 

            // Helper function: รับ type แทน icon
            const addHoliday = (type: string, name: string) => {
                if (!holidays.some(h => h.includes(name))) {
                    // ใช้ | คั่นระหว่างประเภทกับชื่อ
                    holidays.push(`${type}|${name}`);
                }
            };

            // 1. 📍 Local Holidays
            const hLocal = hdLocal.isHoliday(d);
            if (hLocal) {
                const list = Array.isArray(hLocal) ? hLocal : [hLocal];
                list.forEach((h: any) => addHoliday('local', h.name));
            }

            // 2. 🧧 China Holidays
            const hCN = hdCN.isHoliday(d);
            if (hCN) {
                const list = Array.isArray(hCN) ? hCN : [hCN];
                list.forEach((h: any) => {
                    if (h.name.includes('Chinese New Year')) {
                        addHoliday('china', "Chinese New Year");
                    }
                });
            }

            // 3. 🌎 Global Holidays
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

            // 4. Manual Special Days
            const month = d.getMonth() + 1;
            const day = d.getDate();
            if (month === 2 && day === 14) addHoliday('love', "Valentine's Day");
            if (month === 10 && day === 31) addHoliday('halloween', "Halloween");

            if (holidays.length > 0) {
                // สมมติวันนึงมีหลายเทศกาล เอาแค่อันแรกสุดไปโชว์พอ เพื่อความสวยงามในกราฟ
                return holidays[0]; 
            }
            return null;
        };

        if (range === 'year') {
    processedTrend = Array.from({ length: 12 }, (_, i) => {
        const d = startDate.month(i).startOf('month');
        return {
            // ✅ เปลี่ยนจาก label เป็น date
            date: d.locale('th').format('MMM'), 
            
            // ✅ เปลี่ยนจาก total_revenue เป็น value
            value: 0, 
            
            // ✅ เปลี่ยนจาก null เป็น undefined หรือ string ว่าง (ตาม Type ที่ตั้งไว้)
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
    const daysInMonth = startDate.daysInMonth();
    processedTrend = Array.from({ length: daysInMonth }, (_, i) => {
        const d = startDate.date(i + 1);
        const dateStr = d.format('YYYY-MM-DD');
        
        return {
            // ✅ เปลี่ยนจาก label เป็น date
            date: d.format('D'), 
            
            // ✅ เปลี่ยนจาก total_revenue เป็น value
            value: 0, 
            
            // ✅ เปลี่ยนจาก null เป็น undefined (หรือเช็คค่าวันหยุด)
            holiday: undefined 
            
            // 💡 หมายเหตุ: ตัวแปร fullDate ถ้าไม่ได้ใช้ใน Type 
            // ไม่ต้องใส่มาก็ได้ครับ จะได้ไม่ Error เรื่อง Property เกิน
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
            // ✅ แก้ไข: เปลี่ยน label -> date และ total_revenue -> value
            processedTrend = salesData?.map(d => {
                const dateObj = parseDate(d.report_date);
                return {
                    date: dateObj.locale('th').format('D MMM'), 
                    value: Number(d.total_revenue),
                    // ใช้ || undefined เพื่อให้ตรงกับ Type holiday?: string
                    holiday: getHolidayName(d.report_date) || undefined 
                };
            }) || [];
            
            if (processedTrend.length === 0 && range === 'today') {
                // ✅ แก้ไข: ปรับให้ตรงกับ Interface TrendData
                processedTrend = [{ 
                    date: 'วันนี้', 
                    value: 0, 
                    holiday: getHolidayName(now.format('YYYY-MM-DD')) || undefined 
                }];
            }
        }

        // --- ส่วนคำนวณ Summary ---
        // ใช้ข้อมูลดิบจาก salesData (Database) ชื่อ Key จึงเป็นแบบเดิมได้ครับ
        const summary = {
            totalRevenue: salesData?.reduce((sum, item) => sum + Number(item.total_revenue), 0) || 0,
            totalOrders: salesData?.reduce((sum, item) => sum + Number(item.total_orders), 0) || 0,
        };

        // --- ส่วนคำนวณ Top Products ---
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

        // ✅ ส่งออกข้อมูลที่ Clean แล้ว
        return { success: true, range, summary, salesTrend: processedTrend, topProducts };

    } catch (error: any) {
        console.error("Dashboard Error:", error);
        return { success: false, error: error.message };
    }
}