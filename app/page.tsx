'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Boxes, ChefHat, QrCode, ShoppingCart } from 'lucide-react';

// ✅ Component โลโก้ (ดึงไฟล์รูปจาก public/icon.png)
const LogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <img 
    src="/icon.png" 
    alt="SuparPOS Icon" 
    className={`object-contain ${className}`}
  />
);

// 🟢 รูปภาพธีม
const THEME_IMAGES = [
  "https://img.pos-foodscan.com/themes/1772268257454-theme_1772268255882.webp",
  "https://img.pos-foodscan.com/themes/1772268973031-theme_1772268972456.webp",
  "https://img.pos-foodscan.com/themes/1772276353675-theme_1772276352714.webp",
  "https://img.pos-foodscan.com/themes/1772282107542-theme_1772282106973.webp",
  "https://img.pos-foodscan.com/themes/1772270105027-theme_1772270103716.webp"
];

const PHONE_CASES = [
  'bg-[#111827] border-[#111827] ring-slate-800/50',
  'bg-[#163D2D] border-[#163D2D] ring-emerald-950/50',
  'bg-[#E8DCC4] border-[#E8DCC4] ring-amber-900/25',
  'bg-[#263238] border-[#263238] ring-slate-700/60',
  'bg-[#285943] border-[#285943] ring-emerald-900/50',
];

// 🎨 Component: เครื่อง POS การ์ตูน (ปรับขนาดให้ใหญ่เท่ามือถือ และเอามือถือจิ๋วออก)
const CutePOSMockup = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-end justify-center w-[300px] h-[350px] md:w-[420px] md:h-[480px] ${className}`}>
    
    {/* ✨ Sparkles (เส้นแสงวิ้งๆ สีเหลือง) */}
    <div className="absolute top-0 right-12 w-2 h-10 md:w-3 md:h-14 bg-[#FFE55C] rounded-full rotate-[30deg] animate-pulse"></div>
    <div className="absolute top-16 right-0 w-2 h-8 md:w-3 md:h-10 bg-[#FFE55C] rounded-full rotate-[70deg] animate-pulse" style={{animationDelay: '0.2s'}}></div>
    <div className="absolute top-32 -right-4 w-2 h-6 md:w-3 md:h-8 bg-[#FFE55C] rounded-full rotate-[100deg] animate-pulse" style={{animationDelay: '0.4s'}}></div>

    {/* 🖨️ ตัวเครื่อง POS (ขยายสเกลใหญ่ขึ้น) */}
    <div className="relative w-full max-w-[280px] md:max-w-[360px]">
      
      {/* 📄 ใบเสร็จ (Receipt) */}
      <div className="absolute -top-16 md:-top-24 left-1/2 -translate-x-1/2 w-28 h-24 md:w-40 md:h-32 bg-white border-[5px] md:border-[6px] border-slate-800 rounded-t-xl md:rounded-t-2xl z-0 flex flex-col gap-2.5 md:gap-3 p-3 md:p-4 pb-0 group-hover:-translate-y-4 transition-transform duration-300">
        <div className="w-full h-2 md:h-2.5 bg-slate-200 rounded-full"></div>
        <div className="w-[70%] h-2 md:h-2.5 bg-slate-200 rounded-full"></div>
        <div className="w-[85%] h-2 md:h-2.5 bg-slate-200 rounded-full"></div>
        {/* รอยหยักด้านล่างใบเสร็จทำหลอกๆ */}
        <div className="absolute bottom-0 left-0 w-full h-2 md:h-3 bg-gradient-to-r from-transparent to-white border-b-[4px] border-dashed border-slate-800"></div>
      </div>

      {/* ⬛ ฐานรองเครื่อง (Base) */}
      <div className="absolute -bottom-5 md:-bottom-6 left-1/2 -translate-x-1/2 w-[270px] md:w-[340px] h-20 md:h-24 bg-slate-700 rounded-[2rem] z-10 border-[5px] md:border-[6px] border-slate-800 flex justify-center shadow-2xl">
          <div className="w-14 md:w-20 h-2 bg-slate-900 rounded-full mt-12 md:mt-16 opacity-50"></div>
      </div>

      {/* 🟨 บอดี้หลักเครื่อง POS (Main Body) */}
      <div className="relative z-20 w-full h-[240px] md:h-[320px] bg-[#FFF6E5] rounded-[2.5rem] md:rounded-[3rem] border-[6px] md:border-[8px] border-slate-800 shadow-[inset_-10px_-15px_0_rgba(0,0,0,0.06)] flex flex-col items-center pt-5 md:pt-8 px-4 md:px-6">
        
        {/* 🟩 หน้าจอ (Screen) */}
        <div className="w-full h-28 md:h-36 bg-[#2D7A5A] rounded-2xl md:rounded-3xl border-[6px] md:border-[8px] border-slate-800 relative flex justify-center items-center overflow-hidden shadow-inner group/screen cursor-pointer">
            <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full blur-md"></div>
            {/* ตา */}
            <div className="flex gap-6 md:gap-8 items-center">
                <div className="w-3 h-6 md:w-4 md:h-8 bg-white rounded-full group-hover/screen:h-2 transition-all"></div>
                <div className="w-3 h-6 md:w-4 md:h-8 bg-white rounded-full group-hover/screen:h-2 transition-all"></div>
            </div>
            {/* ปากยิ้ม */}
            <svg className="absolute bottom-4 md:bottom-6 w-8 h-4 md:w-10 md:h-5 text-white" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
                <path d="M4 2 Q12 14 20 2" />
            </svg>
        </div>

        {/* 🔢 แผงปุ่มกด (Keypad) */}
        <div className="w-full flex justify-between mt-5 md:mt-8 px-2 md:px-3">
            {/* ปุ่มตัวเลขสีเทา */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-7 h-7 md:w-9 md:h-9 bg-slate-400 rounded-full border-[4px] border-slate-800 shadow-[0_3px_0_#1e293b] active:translate-y-[2px] active:shadow-none transition-all"></div>
                ))}
            </div>
            {/* ปุ่ม Action ด้านขวา (เหลือง, เขียว, ส้ม) */}
            <div className="flex flex-col gap-2 md:gap-3 items-end">
                <div className="w-12 h-5 md:w-16 md:h-7 bg-[#FFE55C] rounded-full border-[4px] border-slate-800 shadow-[0_3px_0_#1e293b]"></div>
                <div className="w-12 h-5 md:w-16 md:h-7 bg-[#4ADE80] rounded-full border-[4px] border-slate-800 shadow-[0_3px_0_#1e293b]"></div>
                <div className="w-14 h-8 md:w-18 md:h-12 bg-[#FF7A59] rounded-xl border-[4px] border-slate-800 shadow-[0_3px_0_#1e293b] mt-1 md:mt-2"></div>
            </div>
        </div>
      </div>
    </div>
  </div>
);

// 📱 Component มือถือจำลอง (ตัวเดิม เพิ่มการรองรับ id)
const PhoneMockup = ({ imageIndex, className = "" }: { imageIndex: number, className?: string }) => (
  <div className={`absolute inset-0 rounded-[2rem] md:rounded-[2.35rem] border-[8px] md:border-[9px] shadow-2xl ring-1 overflow-visible ${PHONE_CASES[imageIndex]} ${className}`}>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[74px] md:w-[82px] h-[22px] md:h-[24px] bg-black rounded-full z-40 flex items-center justify-end px-3 shadow-sm border border-white/5">
          <div className="w-2.5 h-2.5 bg-slate-800/80 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-900/50 rounded-full"></div>
          </div>
      </div>
      <div className="absolute top-24 -left-[14px] w-[2px] h-6 bg-slate-800 rounded-l-md border-y border-l border-slate-700/50 z-0"></div>
      <div className="absolute top-36 -left-[14px] w-[2px] h-12 bg-slate-800 rounded-l-md border-y border-l border-slate-700/50 z-0"></div>
      <div className="absolute top-52 -left-[14px] w-[2px] h-12 bg-slate-800 rounded-l-md border-y border-l border-slate-700/50 z-0"></div>
      <div className="absolute top-40 -right-[14px] w-[2px] h-16 bg-slate-800 rounded-r-md border-y border-r border-slate-700/50 z-0"></div>

      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400 rounded-[1.55rem] md:rounded-[2rem] overflow-hidden">
          <img
              src={THEME_IMAGES[imageIndex]}
              alt={`Theme Preview ${imageIndex + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
          />
      </div>
  </div>
);

const BrandPOSArtwork = () => (
  <div className="pos-alive relative w-[340px] h-[430px] sm:w-[400px] sm:h-[500px] md:w-[580px] md:h-[700px] xl:w-[650px] xl:h-[790px] flex items-center justify-center">
    <div className="absolute inset-[12%] rounded-full bg-emerald-300/40 blur-[58px]"></div>
    <div className="absolute left-[8%] top-[20%] h-3 w-3 rounded-full bg-[#F5C84C] shadow-[0_0_0_8px_rgba(245,200,76,0.13)]"></div>
    <div className="absolute right-[4%] top-[10%] h-4 w-4 rounded-full bg-emerald-500/80 shadow-[0_0_0_10px_rgba(16,185,129,0.12)]"></div>
    <img
      src="/images/pos-mascot.png"
      alt="เครื่อง POS SuparPOS"
      className="relative z-10 h-full w-full object-contain drop-shadow-[0_28px_32px_rgba(15,82,57,0.24)] transition-transform duration-500 group-hover:scale-[1.025]"
    />
    <svg
      viewBox="0 0 1254 1254"
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-1/2 z-20 aspect-square w-full -translate-y-1/2"
    >
      <defs>
        <linearGradient id="animated-pos-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#176143" />
          <stop offset="1" stopColor="#0D4E39" />
        </linearGradient>
      </defs>
      <path
        d="M474 312 Q486 293 510 296 L875 305 Q904 307 899 337 L874 508 Q870 535 844 535 L505 515 Q478 512 477 487 Z"
        fill="url(#animated-pos-screen)"
      />
      <g className="pos-eyes">
        <rect x="565" y="375" width="30" height="70" rx="15" fill="#FFFDF3" />
        <rect x="768" y="383" width="30" height="70" rx="15" fill="#FFFDF3" />
      </g>
      <path
        className="pos-smile"
        d="M632 453 Q682 500 733 455"
        fill="none"
        stroke="#FFFDF3"
        strokeWidth="20"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [isPhoneExiting, setIsPhoneExiting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
      let swapTimer: ReturnType<typeof setTimeout> | undefined;
      const interval = setInterval(() => {
          setIsPhoneExiting(true);
          swapTimer = setTimeout(() => {
              setCurrentThemeIndex((prevIndex) => (prevIndex + 1) % THEME_IMAGES.length);
              setIsPhoneExiting(false);
          }, 360);
      }, 3600);
      return () => {
          clearInterval(interval);
          if (swapTimer) clearTimeout(swapTimer);
      };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('avatar_url, full_name')
            .eq('id', session.user.id)
            .single();
            
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkUser();

    const heroWrapper = document.getElementById('hero-tilt-wrapper');
    const handleHeroTilt = (e: any) => {
        if (!heroWrapper) return;
        const rect = heroWrapper.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;

        const elements = heroWrapper.querySelectorAll('.tilt-element');
        elements.forEach((el: any) => {
            if(el.id === 'hero-phone-center') {
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(8deg)`;
            } else if (el.id === 'cartoon-pos') {
                // เอฟเฟกต์ให้การ์ตูน POS นูนขึ้นมา
                el.style.transform = `perspective(1000px) rotateX(${rotateX * 1.5}deg) rotateY(${rotateY * 1.5}deg) translateZ(40px)`;
            } else {
                el.style.transform = `perspective(1000px) rotateX(${rotateX * 0.8}deg) rotateY(${rotateY * 0.8}deg)`;
            }
        });
    };

    const resetTilt = () => {
        if (!heroWrapper) return;
        const elements = heroWrapper.querySelectorAll('.tilt-element');
        elements.forEach((el: any) => { el.style.transform = ''; });
    };

    if (heroWrapper) {
        heroWrapper.addEventListener('mousemove', handleHeroTilt);
        heroWrapper.addEventListener('touchmove', handleHeroTilt);
        heroWrapper.addEventListener('mouseleave', resetTilt);
        heroWrapper.addEventListener('touchend', resetTilt);
    }

    const handleSpotlight = (e: MouseEvent) => {
        if(window.innerWidth < 768) return;
        const cards = document.querySelectorAll(".spotlight-card");
        for (const card of cards as any) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        }
    }
    document.addEventListener('mousemove', handleSpotlight);

    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white/80', 'backdrop-blur-md', 'shadow-lg', 'shadow-emerald-500/5', 'py-2');
            navbar.classList.remove('bg-white/0', 'backdrop-blur-[0px]', 'py-4');
        } else {
            navbar.classList.remove('bg-white/80', 'backdrop-blur-md', 'shadow-lg', 'shadow-emerald-500/5', 'py-2');
            navbar.classList.add('bg-white/0', 'backdrop-blur-[0px]', 'py-4');
        }
    };
    window.addEventListener('scroll', handleScroll);

    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;
        revealElements.forEach((element) => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    return () => {
        if (heroWrapper) {
            heroWrapper.removeEventListener('mousemove', handleHeroTilt);
            heroWrapper.removeEventListener('touchmove', handleHeroTilt);
            heroWrapper.removeEventListener('mouseleave', resetTilt);
            heroWrapper.removeEventListener('touchend', resetTilt);
        }
        document.removeEventListener('mousemove', handleSpotlight);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', revealOnScroll);
    };
  }, [supabase]);

  const getAvatarUrlForNavbar = (path: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`; 
  };

  return (
    <div className="font-sans text-gray-800 bg-white antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-white">

      {/* Navbar */}
      <nav id="navbar" className="fixed w-full z-50 transition-all duration-500 py-4 px-6 lg:px-12 bg-white/0 backdrop-blur-[0px] text-slate-700 border-b border-transparent">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="#" className="flex items-center gap-2 group relative">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-all duration-300 overflow-hidden border border-emerald-100">
                    <LogoIcon className="w-full h-full p-1" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tight text-slate-800 leading-none group-hover:text-emerald-600 transition-colors">
                        Supar<span className="text-emerald-500">POS</span>
                    </span>
                </div>
            </a>

            <div className="hidden md:flex gap-8 items-center">
                <Link href="/" className="hover:text-emerald-500 transition-colors font-medium relative group">
                    หน้าแรก
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link href="/features" className="hover:text-emerald-500 transition-colors font-medium relative group">
                    จุดเด่น
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link href="/pricing" className="hover:text-emerald-500 transition-colors font-medium relative group">
                    ราคา
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link href="/manual" className="hover:text-emerald-500 transition-colors font-medium relative group">
                    วิธีใช้งาน
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>

                {isAuthLoading ? (
                    <div className="w-24 h-10 bg-slate-200 animate-pulse rounded-full"></div>
                ) : user ? (
                    <Link href="/dashboard/pai_order" className="flex items-center gap-3 p-1 pr-4 bg-white border border-slate-200 rounded-full hover:border-emerald-500 hover:shadow-md transition-all group">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center border border-slate-100">
                            {profile?.avatar_url ? (
                                <img src={getAvatarUrlForNavbar(profile.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <i className="fa-solid fa-user text-emerald-500 text-sm"></i>
                            )}
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">
                            {profile?.full_name?.split(' ')[0] || 'แดชบอร์ด'}
                        </span>
                    </Link>
                ) : (
                    <Link href="/login" className="relative px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-full transition-all shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1 overflow-hidden group">
                        <span className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine"></span>
                        <span className="relative z-10">เข้าสู่ระบบ</span>
                    </Link>
                )}
            </div>

            <button onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')} className="md:hidden text-2xl focus:outline-none hover:text-emerald-500 transition-colors">
                <i className="fa-solid fa-bars"></i>
            </button>
        </div>

        <div id="mobile-menu" className="hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md text-gray-800 shadow-2xl md:hidden flex flex-col items-center py-6 gap-6 mt-0 border-t border-gray-100 transition-all duration-300">
            <a href="#home" className="text-lg font-medium hover:text-emerald-600">หน้าแรก</a>
            <a href="features" className="text-lg font-medium hover:text-emerald-600">จุดเด่น</a>
            <a href="pricing" className="text-lg font-medium hover:text-emerald-600">ราคา</a>
            <a href="#howitworks" className="text-lg font-medium hover:text-emerald-600">วิธีใช้งาน</a>
            
            {!isAuthLoading && user ? (
                 <Link href="/dashboard/pai_order" className="flex items-center gap-3 text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/30">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                        {profile?.avatar_url ? (
                            <img src={getAvatarUrlForNavbar(profile.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <i className="fa-solid fa-user text-white text-xs"></i>
                        )}
                    </div>
                    เข้าสู่แดชบอร์ด
                 </Link>
            ) : (
                <Link href="/register" className="text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-2 rounded-full font-bold shadow-lg shadow-emerald-500/30">สมัครใช้งานฟรี</Link>
            )}
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section id="home" className="hero-bg min-h-screen flex items-center justify-center px-4 relative pt-20 overflow-hidden bg-[#F4FBF4]">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-25 animate-blob pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-35 animate-blob pointer-events-none" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob pointer-events-none" style={{animationDelay: '4s'}}></div>

        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10 pt-10">
            
            {/* Text */}
            <div className="text-left reveal active order-2 lg:order-1 relative z-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-emerald-100 text-emerald-600 mb-6 text-sm font-semibold tracking-wide shadow-sm backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    ระบบ POS สแกนสั่งอาหารยุคใหม่
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-[54px] xl:text-[58px] font-bold mb-6 leading-[1.12] text-slate-900">
                    SuparPOS สั่งง่าย<br/>
                    <span className="bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.emerald.600),theme(colors.emerald.400),theme(colors.teal.500),theme(colors.emerald.600))] bg-[length:200%_auto] animate-shimmer">
                        บริหารจัดการครบวงจร
                    </span>
                </h1>
                <p className="text-slate-600 text-lg md:text-xl mb-10 font-light leading-relaxed max-w-lg">
                    เปลี่ยนร้านอาหารของคุณให้เป็นระบบดิจิทัล ลดการรอคอย ลดความผิดพลาด ลูกค้าแฮปปี้ <span className="font-semibold text-slate-800">ออเดอร์แม่นยำ ยอดขายดีขึ้นเห็นๆ</span>
                </p>
                <div className="hidden lg:grid grid-cols-3 gap-3 mb-8 max-w-xl">
                    {[
                        ['ครบในระบบเดียว', 'ขาย · ครัว · สต็อก'],
                        ['ทุกอุปกรณ์', 'มือถือ · แท็บเล็ต · PC'],
                        ['ข้อมูลทันที', 'ยอดขายแบบ Real-time'],
                    ].map(([title, detail]) => (
                        <div key={title} className="rounded-2xl border border-emerald-100 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <div className="mb-1 flex items-center gap-2 text-xs font-black text-emerald-700">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                {title}
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500">{detail}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={user ? "/dashboard/pai_order" : "/register"} className="relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-full text-white font-bold text-lg transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 group transform hover:-translate-y-1 hover:shadow-emerald-500/50 overflow-hidden active:scale-95 duration-100">
                        <span className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine"></span>
                        <i className={`fa-solid ${user ? 'fa-arrow-right-to-bracket' : 'fa-rocket'} group-hover:rotate-12 transition-transform`}></i> 
                        {user ? 'เข้าสู่แดชบอร์ด' : 'สมัครใช้งานฟรี'}
                    </Link>
                    <a href="https://www.youtube.com/watch?v=xiuRS7e-5R8" className="px-8 py-4 bg-white/80 border border-slate-200 hover:bg-white text-slate-700 rounded-full font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg backdrop-blur-sm hover:-translate-y-1 active:scale-95 duration-100">
                        <i className="fa-regular fa-circle-play text-emerald-500 text-xl"></i> ดูวิดีโอตัวอย่าง
                    </a>
                </div>
            </div>

            {/* 🟢 3D Layout (มือถือ 1 เครื่อง + เครื่อง POS ขนาดใหญ่) */}
            <div className="relative z-10 flex justify-center items-center order-1 lg:order-2 tilt-wrapper w-full h-[550px] md:h-[700px] mt-10 lg:mt-0" id="hero-tilt-wrapper">
                {/* <div className="hidden lg:block absolute inset-[7%] rounded-[4rem] border border-white/80 bg-gradient-to-br from-white/70 via-emerald-50/70 to-green-100/50 shadow-[0_35px_90px_-45px_rgba(21,128,61,0.45)] backdrop-blur-sm"></div>
                 */}
                {/* 🛒 เครื่อง POS การ์ตูนวาดด้วยโค้ด (ปรับขนาดใหญ่และวางซ้าย) */}
                <div id="cartoon-pos" className="tilt-element absolute z-30 bottom-0 md:bottom-2 -left-8 md:-left-16 group hover:-translate-y-3 transition-transform duration-500">
                    <BrandPOSArtwork />
                </div>

                {/* 📱 Phone 3 (เหลือเครื่องเดียว เป็นเครื่องหลัก วางขวา) */}
                <div
                    id="hero-phone-center"
                    className="tilt-element absolute z-50 top-24 -right-2 sm:top-16 sm:right-1 md:top-28 md:-right-1 xl:right-2 w-[145px] h-[303px] min-[420px]:w-[165px] min-[420px]:h-[345px] sm:w-[180px] sm:h-[375px] md:w-[190px] md:h-[395px] xl:w-[205px] xl:h-[425px] rotate-[8deg] cursor-pointer"
                >
                    <PhoneMockup
                        key={currentThemeIndex}
                        imageIndex={currentThemeIndex}
                        className={isPhoneExiting ? 'phone-single-exit' : 'phone-single-enter'}
                    />
                </div>
            </div>
        </div>
      </section>

      <section className="hidden lg:block relative z-20 -mt-14 pb-10">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-3 px-6">
          {[
            { icon: ShoppingCart, title: 'หน้าขาย POS', detail: 'คิดเงินไว ใช้งานง่าย' },
            { icon: QrCode, title: 'QR Ordering', detail: 'ลูกค้าสั่งเองจากโต๊ะ' },
            { icon: ChefHat, title: 'จอครัว Real-time', detail: 'ออเดอร์ไม่ตกหล่น' },
            { icon: Boxes, title: 'สต็อกและรายงาน', detail: 'รู้ต้นทุนและยอดขาย' },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="group flex items-center gap-4 rounded-2xl border border-emerald-100/90 bg-white px-5 py-4 shadow-[0_14px_35px_-22px_rgba(21,128,61,0.35)] transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_20px_40px_-22px_rgba(21,128,61,0.45)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Icon size={21} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">{title}</h3>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center relative z-10">
            <div className="reveal max-w-2xl mx-auto mb-16">
                <h3 className="text-emerald-500 font-bold mb-2 uppercase tracking-wider text-sm">ทำไมต้องเลือกเรา</h3>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">ฟีเจอร์ครบ จบในที่เดียว</h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    {icon: 'fa-bolt', title: 'Setup ไวใน 5 นาที', desc: 'ระบบอัตโนมัติ 100% สมัครปุ๊บ ได้ QR Code ปั๊บ ไม่ต้องรอเจ้าหน้าที่ติดต่อกลับ', color: 'text-emerald-500', bg: 'group-hover:bg-emerald-500', shadow: 'hover:shadow-emerald-100/50'},
                    {icon: 'fa-money-bill-trend-up', title: 'เพิ่มยอดขายต่อโต๊ะ', desc: 'รูปภาพเมนูสวยงามชวนหิว กระตุ้นให้ลูกค้าสั่งอาหารเพิ่มขึ้นเฉลี่ย 20%', color: 'text-emerald-600', bg: 'group-hover:bg-emerald-600', shadow: 'hover:shadow-emerald-100/50'},
                    {icon: 'fa-chart-pie', title: 'ข้อมูลเชิงลึก', desc: 'Dashboard สรุปยอดขาย เมนูขายดี ช่วงเวลาพีค ช่วยวางแผนสต็อกวัตถุดิบแม่นยำ', color: 'text-green-500', bg: 'group-hover:bg-green-500', shadow: 'hover:shadow-green-100/50'}
                ].map((item, idx) => (
                    <div key={idx} className={`spotlight-card relative p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-2xl ${item.shadow} transition-all duration-500 hover:-translate-y-2 reveal group text-left overflow-hidden ${idx === 1 ? 'delay-100' : idx === 2 ? 'delay-200' : ''}`}>
                        <div className="relative z-10">
                            <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm ${item.bg} group-hover:text-white transition-all duration-300 border border-slate-100 group-hover:scale-110 group-hover:rotate-6`}>
                                <i className={`fa-solid ${item.icon} ${item.color} group-hover:text-white`}></i>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      {/* 3. How It Works */}
      <section id="howitworks" className="py-24 bg-emerald-50/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white to-transparent opacity-60 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-20 reveal">
                <h3 className="text-emerald-500 font-bold mb-2 uppercase tracking-wider text-sm">Easy Step</h3>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">ใช้งานง่าย...จนคุณตกใจ</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-12 relative">
                <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-slate-200 border-t-2 border-dashed border-slate-300 -z-10"></div>
                {[
                    {icon: 'fa-qrcode', title: 'สแกน', desc: 'ลูกค้าสแกน QR Code บนโต๊ะด้วยมือถือเครื่องไหนก็ได้'},
                    {icon: 'fa-utensils', title: 'เลือก', desc: 'ดูรูปเมนูสวยๆ เลือก Option ที่ชอบ และกดสั่งได้เอง'},
                    {icon: 'fa-check-double', title: 'เสิร์ฟ', desc: 'ออเดอร์วิ่งเข้าครัวทันที พนักงานเตรียมเสิร์ฟอย่างเดียว'}
                ].map((step, idx) => (
                    <div key={idx} className={`relative reveal group flex flex-col items-center ${idx === 1 ? 'delay-100' : idx === 2 ? 'delay-200' : ''}`}>
                        <div className="w-20 h-20 bg-white border-4 border-white shadow-xl shadow-emerald-100 rounded-full flex items-center justify-center text-3xl text-emerald-500 mb-8 z-10 relative group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <i className={`fa-solid ${step.icon}`}></i>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full text-white text-base font-bold flex items-center justify-center border-2 border-white">{idx + 1}</div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-800">{step.title}</h3>
                        <p className="text-slate-500 text-center max-w-xs">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 5. Registration */}
      <section id="register" className="py-32 relative bg-white overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-emerald-100 rounded-full blur-[120px] opacity-40 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-100 rounded-full blur-[120px] opacity-45 translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="reveal text-center mb-16">
                <h3 className="text-emerald-500 font-bold mb-3 uppercase tracking-[0.2em] text-sm">Get Started</h3>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                    สมัครง่าย<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-lime-500">เข้าใช้งานได้ทันที</span>
                </h2>
                <p className="mt-6 text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    หากสมัครเสร็จ ให้ทำการเพิ่มข้อมูลร้านเพื่อใช้งานระบบแบบมีประสิทธิภาพ
                </p>
            </div>

            <div className="reveal delay-100 grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-5 space-y-4">
                    {[
                        {icon: 'fa-bolt-lightning', color: 'text-green-500', bg: 'bg-green-50', title: 'Zero Setup', desc: 'ระบบถูกตั้งค่าไว้ให้พร้อมใช่งาน เพียงสมัครจะได้ร้านของตัวเองทันที'},
                        {icon: 'fa-mobile-screen-button', color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Real Dashboard', desc: 'จัดการเมนู ดูออเดอร์ และสรุปยอดขายได้แบบ Real-time'},
                        {icon: 'fa-wand-magic-sparkles', color: 'text-lime-600', bg: 'bg-lime-50', title: 'Full Features', desc: 'ลองใช้ระบบหลังบ้าน (Backstore) ได้ครบทุกฟังก์ชัน'}
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color} flex-shrink-0`}>
                                <i className={`fa-solid ${item.icon} text-xl`}></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{item.title}</h4>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="md:col-span-7">
                    <div className="cta-box p-8 md:p-12 rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl shadow-emerald-500/10 group bg-white border border-emerald-50">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-lime-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className="mb-8 flex justify-center">
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-5xl text-emerald-500 shadow-xl border border-slate-50 animate-float">
                                    <i className="fa-solid fa-rocket"></i>
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">พร้อมลุยแล้วหรือยัง?</h3>
                            <p className="text-slate-500 mb-10">กดปุ่มด้านล่างเพื่อเข้าสู่ระบบทดได้ทันที</p>

                            <Link 
                                href={user ? "/dashboard/pai_order" : "/register"}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black py-6 rounded-2xl text-2xl shadow-2xl shadow-emerald-500/40 transform transition-all hover:scale-[1.03] active:scale-95 duration-200 flex items-center justify-center gap-4 relative overflow-hidden group/btn">
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:animate-shine"></span>
                                {user ? 'ไปที่แดชบอร์ด' : 'สมัครใช้งานฟรี'}
                                <i className="fa-solid fa-chevron-right text-lg group-hover/btn:translate-x-2 transition-transform"></i>
                            </Link>
                            
                            <div className="mt-6 flex items-center justify-center gap-6">
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <i className="fa-solid fa-shield-check text-green-500"></i> No Credit Card
                                </span>
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <i className="fa-solid fa-bolt text-emerald-500"></i> Instant Set Up
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="bg-slate-50 text-slate-500 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
            
            {/* Column 1: Logo & Address */}
            <div className="lg:col-span-5 space-y-6">
                <a href="#" className="flex items-center gap-2 group relative">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-all duration-300 overflow-hidden border border-emerald-100">
                        <LogoIcon className="w-full h-full p-1" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight text-slate-800 leading-none">
                            Supar<span className="text-emerald-500">POS</span>
                        </span>
                    </div>
                </a>
                
                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-800">
                        SuparPOS System <span className="font-normal text-slate-500">(ดำเนินการโดย นาย วรธน นำทอง)</span>
                    </p>
                    <p>
                        บ้านเลขที่78หมู่ 4 ต.นาเยีย อ.นาเยีย<br/>
                        จังหวัด อุบลราชธานี รหัสไปรษณีย์ 34160
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">โทร:</span> 
                        <a href="tel:0997547764" className="text-emerald-600 hover:underline font-medium">099-754-7764</a>
                    </p>
                    <p className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">อีเมล:</span>
                        <a href="mailto:posfoodscan@gmail.com" className="text-emerald-600 hover:underline font-medium">posfoodscan@gmail.com</a>
                    </p>
                </div>
            </div>

            {/* Column 2: Services */}
            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">บริการของเรา</h4>
                <div className="flex flex-col gap-3 text-sm font-medium">
                    <Link href="/" className="hover:text-emerald-500 transition-colors">หน้าแรก</Link>
                    <Link href="/pricing" className="hover:text-emerald-500 transition-colors">แพ็กเกจราคา</Link>
                    <Link href="/manual" className="hover:text-emerald-500 transition-colors">คู่มือการใช้งาน</Link>
                </div>
            </div>

            {/* Column 3: Policy */}
            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">นโยบาย</h4>
                <div className="flex flex-col gap-3 text-sm font-medium">
                    <Link href="/terms" className="hover:text-emerald-500 transition-colors">เงื่อนไขการบริการ</Link>
                    <Link href="/privacy" className="hover:text-emerald-500 transition-colors">ความเป็นส่วนตัว</Link>
                    <Link href="/refund" className="hover:text-emerald-500 transition-colors">นโยบายการคืนเงิน</Link>
                </div>
            </div>

            {/* Column 4: Social & Payment */}
            <div className="lg:col-span-3 flex flex-col items-start lg:items-end gap-8">
                <div className="flex gap-4 text-2xl text-slate-400">
                    <a href="#" target="_blank" className="hover:text-[#00B900] transition-transform hover:scale-110"><i className="fa-brands fa-line"></i></a>
                    <a href="#" target="_blank" className="hover:text-[#1877F2] transition-transform hover:scale-110"><i className="fa-brands fa-facebook"></i></a>
                    <a href="#" target="_blank" className="hover:text-[#E4405F] transition-transform hover:scale-110"><i className="fa-brands fa-instagram"></i></a>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ช่องทางการชำระเงิน</span>
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <i className="fa-brands fa-cc-visa text-3xl text-[#1A1F71]" title="Visa"></i>
                        <i className="fa-brands fa-cc-mastercard text-3xl text-[#EB001B]" title="Mastercard"></i>
                        <i className="fa-brands fa-cc-jcb text-3xl text-[#007940]" title="JCB"></i>
                        <div className="w-px h-6 bg-slate-300 mx-2"></div>
                        <img 
                            src="https://cdn.prod.website-files.com/65e210a414fae2cb8054a9b4/6789cc7973863d34426baf54_678316f2a65ae45dd6a22f9f_678303b39e0a1b2f05c23bc4_673ac03613ce1d036f897c16_thaiqr_logosimbolo.png" 
                            alt="Thai QR" 
                            className="h-7 w-auto object-contain"
                        />
                    </div>
                </div>
            </div>

          </div>

          {/* Copyright */}
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} SuparPOS. All rights reserved.</p>
            <p className="text-sm text-slate-400 flex items-center gap-1">
                Made with <i className="fa-solid fa-heart text-emerald-500 text-xs"></i> in Thailand
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
}
