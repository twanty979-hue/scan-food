'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// --- Icons ---
const IconGlobe = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const IconCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);
const IconChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);
const IconArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const IconServer = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
);

// --- Global Timezone Generator with Smart Keywords ---
type TimezoneOption = {
  value: string;
  label: string;
  searchString: string;
  offset: number;
};

const CITY_KEYWORD_MAP: Record<string, string> = {
  'Bangkok': 'Thailand Thai Siam ไทย กรุงเทพ',
  'Phnom_Penh': 'Cambodia Khmer กัมพูชา เขมร',
  'Vientiane': 'Laos Lao ลาว',
  'Yangon': 'Myanmar Burma พม่า',
  'Jakarta': 'Indonesia',
  'Ho_Chi_Minh': 'Vietnam เวียดนาม',
  'Singapore': 'SG สิงคโปร์',
  'Tokyo': 'Japan JP ญี่ปุ่น',
  'Seoul': 'Korea KR เกาหลี',
  'Taipei': 'Taiwan ไต้หวัน',
  'London': 'UK England British อังกฤษ',
  'New_York': 'USA America US',
  'Los_Angeles': 'USA US California',
  'Sydney': 'Australia AU',
  'Paris': 'France ฝรั่งเศส',
  'Berlin': 'Germany เยอรมัน',
};

const getGlobalTimezones = (): TimezoneOption[] => {
  try {
    const timezones = Intl.supportedValuesOf('timeZone');
    const now = new Date();
    
    return timezones.map(tz => {
      const str = now.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'longOffset' });
      const offsetPart = str.split('GMT')[1] || '+00:00';
      const cleanOffset = `GMT${offsetPart}`;
      
      const sign = offsetPart.includes('-') ? -1 : 1;
      const [h, m] = offsetPart.replace('+', '').replace('-', '').split(':').map(Number);
      const totalMinutes = sign * (h * 60 + m);

      const city = tz.split('/')[1] || '';
      const extraKeywords = CITY_KEYWORD_MAP[city] || '';
      const searchString = `${tz} ${cleanOffset} ${extraKeywords}`.toLowerCase();

      return {
        value: tz,
        label: `(${cleanOffset}) ${tz}`,
        searchString,
        offset: totalMinutes
      };
    }).sort((a, b) => a.offset - b.offset); 
  } catch (e) {
    return [
      { value: 'Asia/Bangkok', label: '(GMT+07:00) Asia/Bangkok', searchString: 'thai', offset: 420 },
      { value: 'UTC', label: '(GMT+00:00) UTC', searchString: 'utc', offset: 0 }
    ];
  }
};

const generateRandomToken = () => Math.random().toString(36).substring(2, 10);

export default function SetupTutorialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'config' | 'processing' | 'done'>('config');
  const [brandId, setBrandId] = useState<string | null>(null);
  
  // Timezone State
  const tzList = useMemo(() => getGlobalTimezones(), []); 
  const [selectedTz, setSelectedTz] = useState<TimezoneOption | null>(null);
  const [searchTz, setSearchTz] = useState('');
  const [isTzOpen, setIsTzOpen] = useState(false);
  const tzDropdownRef = useRef<HTMLDivElement>(null);

  // Processing State
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing...');

  // 1. Load User & NO Redirect Check
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const { data: profile } = await supabase.from('profiles').select('brand_id').eq('id', user.id).single();
      
      if (profile?.brand_id) {
        // ✅ ลบการเช็ค Redirect ออก เพื่อไม่ให้มันดีดหนี
        setBrandId(profile.brand_id);
      } else {
        router.replace('/setup');
      }

      const bkk = tzList.find(t => t.value === 'Asia/Bangkok');
      if (bkk) setSelectedTz(bkk);
    };
    init();

    const handleClickOutside = (event: MouseEvent) => {
      if (tzDropdownRef.current && !tzDropdownRef.current.contains(event.target as Node)) {
        setIsTzOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [router, tzList]);

  // Filter Logic
  const filteredTz = useMemo(() => {
    if (!searchTz) return tzList;
    const lowerSearch = searchTz.toLowerCase();
    return tzList.filter(t => t.searchString.includes(lowerSearch));
  }, [searchTz, tzList]);

  // --- Main Logic ---
  const handleStartSetup = async () => {
    // 1. Validate Form
    if (!brandId || !selectedTz) return;

    setStep('processing');
    setLoading(true);

    try {
      // Step 1: Timezone
      setProgress(20);
      setStatusText('Setting up store timezone...');
      await supabase.from('brands').update({ timezone: selectedTz.value }).eq('id', brandId);

      // Step 2: Tables
      setProgress(40);
      setStatusText('Generating default tables...');
      const tablesData = Array.from({ length: 10 }, (_, i) => ({
        brand_id: brandId, label: `T-${i + 1}`, capacity: 4, status: 'available', access_token: generateRandomToken() 
      }));
      await supabase.from('tables').insert(tablesData);

      // Step 3: Banners
      setProgress(60);
      setStatusText('Designing storefront banners...');
      const bannersData = [
        { brand_id: brandId, image_name: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/delicious-food-banner-template-design-cd3994e39458960f4f33e73b8c60edb9_screen.jpg?ts=1645769305', title: 'Welcome', sort_order: 1 },
        { brand_id: brandId, image_name: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/healthy-food-restaurant-banner-design-template-5d8526f015d6a01027536b17714b98d3_screen.jpg?ts=1662349433', title: 'Special Menu', sort_order: 2 }
      ];
      await supabase.from('banners').insert(bannersData);

      // Step 4: Products
      setProgress(80);
      setStatusText('Importing sample menu items...');
      const { data: sourceCats } = await supabase.from('categoriesphotoadmin').select('*');
      const { data: sourceImages } = await supabase.from('images').select('*');

      if (sourceCats && sourceImages) {
        const catMap: Record<number, string> = {};
        for (const cat of sourceCats) {
          const { data: newCat } = await supabase.from('categories').insert({ brand_id: brandId, name: cat.name, is_active: true }).select().single();
          if (newCat) catMap[cat.id] = newCat.id;
        }
        const productsToInsert = sourceImages.map((img, index) => ({
          brand_id: brandId,
          name: img.name, image_name: img.url, price: img.price || 0,
          category_id: img.category_id ? catMap[img.category_id] : null,
          is_available: true, is_recommended: index < 4 
        }));
        await supabase.from('products').insert(productsToInsert);
      }

      // Done
      setProgress(100);
      setStatusText('Setup Completed!');
      await new Promise(r => setTimeout(r, 800));
      setStep('done');
      
      // ✅ Redirect to pai_order (เสร็จแล้วค่อยดีดที่นี่)
      setTimeout(() => {
        router.replace('/dashboard/pai_order');
      }, 1500);

    } catch (err: any) {
      alert('Error: ' + err.message);
      setStep('config');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-800">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm mb-6">
            <IconServer className="text-blue-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-slate-500 mt-2 text-sm">Initialize database and store settings.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          
          {/* STEP 1: CONFIGURATION */}
          {step === 'config' && (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Select Store Timezone
                </label>
                
                {/* Custom Dropdown */}
                <div className="relative" ref={tzDropdownRef}>
                  <div 
                    className={`flex items-center w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 hover:bg-white hover:border-slate-300 transition-colors cursor-text ${isTzOpen ? 'ring-2 ring-blue-100 border-blue-500' : ''}`}
                    onClick={() => setIsTzOpen(true)}
                  >
                    <IconGlobe className="text-slate-400 w-5 h-5 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder-slate-400 text-sm"
                      value={isTzOpen ? searchTz : (selectedTz?.label || '')}
                      onChange={(e) => {
                        setSearchTz(e.target.value);
                        setIsTzOpen(true);
                      }}
                      onFocus={() => {
                        setSearchTz('');
                        setIsTzOpen(true);
                      }}
                      placeholder="Search Country or City (e.g. Thai)"
                    />
                    <IconChevronDown className="text-slate-400 w-4 h-4 ml-2" />
                  </div>

                  {/* Dropdown List */}
                  {isTzOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                      {filteredTz.length > 0 ? (
                        filteredTz.map((tz) => (
                          <div
                            key={tz.value}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${selectedTz?.value === tz.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600'}`}
                            onClick={() => {
                              setSelectedTz(tz);
                              setSearchTz(tz.label);
                              setIsTzOpen(false);
                            }}
                          >
                            {tz.value.includes('Bangkok') ? '🇹🇭 ' : ''} {tz.label}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center">No timezone found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Items */}
              <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
                <h3 className="text-xs font-semibold text-slate-900 mb-3">AUTOMATED SETUP ACTIONS</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 text-[10px]"><IconCheck className="w-3 h-3"/></div>
                    Set Store Timezone
                  </li>
                  <li className="flex items-center text-sm text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 text-[10px]"><IconCheck className="w-3 h-3"/></div>
                    Generate default tables & menus
                  </li>
                </ul>
              </div>

              <button 
                onClick={handleStartSetup}
                disabled={loading || !selectedTz}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium shadow-lg hover:bg-slate-800 hover:shadow-slate-800/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Start Installation'} 
                {!loading && <IconArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* STEP 2: PROCESSING */}
          {step === 'processing' && (
            <div className="p-10 text-center animate-in zoom-in duration-300">
              <div className="mb-6 relative w-20 h-20 mx-auto">
                <svg className="animate-spin w-full h-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Setting up your store</h3>
              <p className="text-slate-500 text-sm mb-6">{statusText}</p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {/* STEP 3: DONE */}
          {step === 'done' && (
            <div className="p-10 text-center animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-green-500/30">
                <IconCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Setup Completed</h2>
              <p className="text-slate-500 text-sm">Redirecting to Pai Order...</p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          Secure Installation • Powered by ScanFood
        </p>

      </div>
    </div>
  );
}