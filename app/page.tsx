'use client';
import React, { useEffect } from 'react';
import Link from 'next/link'; // ✅ Import Link มาใช้

export default function LandingPage() {

  // Logic การทำงาน (3D Tilt, Scroll Reveal, Mobile Menu)
  useEffect(() => {
    // 1. 3D Tilt Logic
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

        const rotateX = ((y - centerY) / centerY) * -15; 
        const rotateY = ((x - centerX) / centerX) * 15;

        const elements = heroWrapper.querySelectorAll('.tilt-element');
        elements.forEach((el: any) => {
            if(el.id === 'hero-phone') {
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            } else {
                el.style.transform = `perspective(1000px) rotateX(${rotateX * 1.2}deg) rotateY(${rotateY * 1.2}deg) translateZ(50px)`;
            }
        });
    };

    const resetTilt = () => {
        if (!heroWrapper) return;
        const elements = heroWrapper.querySelectorAll('.tilt-element');
        elements.forEach((el: any) => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    };

    if (heroWrapper) {
        heroWrapper.addEventListener('mousemove', handleHeroTilt);
        heroWrapper.addEventListener('touchmove', handleHeroTilt);
        heroWrapper.addEventListener('mouseleave', resetTilt);
        heroWrapper.addEventListener('touchend', resetTilt);
    }

    // 2. Spotlight Effect
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

    // 3. Navbar Scroll
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white/80', 'backdrop-blur-md', 'shadow-lg', 'shadow-brand-500/5', 'py-2');
            navbar.classList.remove('bg-white/0', 'backdrop-blur-[0px]', 'py-4');
        } else {
            navbar.classList.remove('bg-white/80', 'backdrop-blur-md', 'shadow-lg', 'shadow-brand-500/5', 'py-2');
            navbar.classList.add('bg-white/0', 'backdrop-blur-[0px]', 'py-4');
        }
    };
    window.addEventListener('scroll', handleScroll);

    // 4. Scroll Reveal
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
    revealOnScroll(); // init

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
  }, []);

  return (
    <div className="font-sans text-gray-800 bg-white antialiased overflow-x-hidden selection:bg-brand-500 selection:text-white">

      {/* Navbar */}
      <nav id="navbar" className="fixed w-full z-50 transition-all duration-500 py-4 px-6 lg:px-12 bg-white/0 backdrop-blur-[0px] text-slate-700 border-b border-transparent">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <a href="#" className="text-2xl font-bold tracking-wider flex items-center gap-2 group relative">
                <div className="absolute inset-0 bg-brand-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10">
                    <i className="fa-solid fa-qrcode"></i>
                </div>
                <span className="relative z-10 group-hover:tracking-widest transition-all duration-300">Quick<span className="text-brand-500">Order</span></span>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8 items-center">
                <a href="#home" className="hover:text-brand-500 transition-colors font-medium relative group">หน้าแรก<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span></a>
                <a href="#features" className="hover:text-brand-500 transition-colors font-medium relative group">จุดเด่น<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span></a>
                <a href="#howitworks" className="hover:text-brand-500 transition-colors font-medium relative group">วิธีใช้งาน<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span></a>
                {/* ✅ แก้ลิงก์ปุ่มสมัคร */}
                <Link href="/login" className="relative px-6 py-2 bg-brand-600 text-white hover:bg-brand-700 font-bold rounded-full transition-all shadow-lg hover:shadow-brand-500/50 hover:-translate-y-1 overflow-hidden group">
                    <span className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine"></span>
                    <span className="relative z-10">สมัครใช้งานฟรี</span>
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')} className="md:hidden text-2xl focus:outline-none hover:text-brand-500 transition-colors">
                <i className="fa-solid fa-bars"></i>
            </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div id="mobile-menu" className="hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md text-gray-800 shadow-2xl md:hidden flex flex-col items-center py-6 gap-6 mt-0 border-t border-gray-100 transition-all duration-300">
            <a href="#home" className="text-lg font-medium hover:text-brand-600">หน้าแรก</a>
            <a href="#features" className="text-lg font-medium hover:text-brand-600">จุดเด่น</a>
            <a href="#howitworks" className="text-lg font-medium hover:text-brand-600">วิธีใช้งาน</a>
            {/* ✅ แก้ลิงก์ Mobile Menu */}
            <Link href="/register" className="text-white bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-2 rounded-full font-bold shadow-lg shadow-brand-500/30">สมัครใช้งานฟรี</Link>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section id="home" className="hero-bg min-h-screen flex items-center justify-center px-4 relative pt-20 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob pointer-events-none" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob pointer-events-none" style={{animationDelay: '4s'}}></div>

        <div className="max-w-7xl w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
            {/* Text */}
            <div className="text-left reveal active order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-brand-100 text-brand-600 mb-6 text-sm font-semibold tracking-wide shadow-sm backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    ระบบร้านอาหารยุค 2024
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-slate-900">
                    สแกนปุ๊บ สั่งปั๊บ<br/>
                    <span className="bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.brand.600),theme(colors.brand.400),theme(colors.purple.500),theme(colors.brand.600))] bg-[length:200%_auto] animate-shimmer">
                        ยอดขายพุ่งทันที
                    </span>
                </h1>
                <p className="text-slate-600 text-lg md:text-xl mb-10 font-light leading-relaxed max-w-lg">
                    เปลี่ยนร้านอาหารของคุณให้เป็นระบบดิจิทัล ลดการรอคอย ลดความผิดพลาด ลูกค้าแฮปปี้ <span className="font-semibold text-slate-800">ยอดขายดีขึ้นเห็นๆ</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* ✅ แก้ลิงก์ปุ่ม Hero */}
                    <Link href="/login" className="relative px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 rounded-full text-white font-bold text-lg transition-all shadow-xl shadow-brand-500/30 flex items-center justify-center gap-3 group transform hover:-translate-y-1 hover:shadow-brand-500/50 overflow-hidden active:scale-95 duration-100">
                        <span className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-shine"></span>
                        <i className="fa-solid fa-rocket group-hover:rotate-12 transition-transform"></i> ทดลองใช้ฟรี 14 วัน
                    </Link>
                    <a href="#features" className="px-8 py-4 bg-white/80 border border-slate-200 hover:bg-white text-slate-700 rounded-full font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-lg backdrop-blur-sm hover:-translate-y-1 active:scale-95 duration-100">
                        <i className="fa-regular fa-circle-play text-brand-500 text-xl"></i> ดูวิดีโอตัวอย่าง
                    </a>
                </div>
            </div>

            {/* 3D Phone */}
            <div className="relative z-10 flex justify-center order-1 md:order-2 tilt-wrapper w-fit mx-auto" id="hero-tilt-wrapper">
                <div className="tilt-element relative w-[280px] h-[580px] bg-slate-800 rounded-[3rem] border-[8px] border-slate-700 shadow-2xl overflow-hidden ring-1 ring-white/20 group cursor-pointer" id="hero-phone">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-white">
                        <div className="bg-gradient-to-br from-brand-500 to-brand-600 h-32 p-6 text-white pt-10 shadow-lg relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                            <div className="font-bold text-xl relative z-10">Blue Sky Café</div>
                            <div className="text-sm opacity-90 relative z-10 flex items-center gap-1"><i className="fa-solid fa-location-dot text-xs"></i> โต๊ะ: 08</div>
                        </div>
                        <div className="p-4 space-y-4 overflow-hidden">
                            {/* Dummy Items */}
                            {[
                                {name: 'สลัดแซลมอน', price: '฿180', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100&auto=format&fit=crop'},
                                {name: 'เบอร์เกอร์เนื้อ', price: '฿250', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=100&auto=format&fit=crop'},
                                {name: 'พิซซ่าเตาถ่าน', price: '฿320', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=100&auto=format&fit=crop'}
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-3 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 active:bg-slate-50 transition-all p-2 rounded-2xl border border-slate-100 group/item cursor-pointer">
                                    <div className="w-20 h-20 bg-slate-100 rounded-xl bg-cover group-hover/item:scale-105 transition-transform duration-500" style={{backgroundImage: `url(${item.img})`}}></div>
                                    <div className="flex-1 py-1">
                                        <div className="font-bold text-slate-800">{item.name}</div>
                                        <div className="text-brand-500 font-bold">{item.price}</div>
                                        {idx === 0 && <div className="text-[10px] text-white bg-brand-400 px-2 py-0.5 rounded-full inline-block mt-1">แนะนำ</div>}
                                    </div>
                                    <div className="flex items-end pb-1 pr-1">
                                        <div className="w-8 h-8 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 hover:bg-brand-500 hover:text-white transition-colors cursor-pointer shadow-sm"><i className="fa-solid fa-plus"></i></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 floating-badge">
                            <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white flex justify-between px-6 py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/30 cursor-pointer hover:scale-105 active:scale-95 transition-transform border-t border-white/20">
                                <span>3 รายการ</span>
                                <span>฿750 <i className="fa-solid fa-arrow-right ml-2 animate-pulse"></i></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating QR */}
                <div className="tilt-element absolute -bottom-6 -left-6 md:bottom-20 md:-left-16 w-44 h-44 p-3 rounded-3xl shadow-2xl qr-frame backdrop-blur-sm bg-white/90 floating-qr">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DemoOrder&color=0ea5e9" alt="QR Code" className="w-full h-full opacity-90" />
                    <div className="scanner-line"></div>
                    <div className="qr-corner tl"></div>
                    <div className="qr-corner tr"></div>
                    <div className="qr-corner bl"></div>
                    <div className="qr-corner br"></div>
                    <div className="absolute inset-0 bg-brand-400 blur-2xl opacity-20 -z-10"></div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center relative z-10">
            <div className="reveal max-w-2xl mx-auto mb-16">
                <h3 className="text-brand-500 font-bold mb-2 uppercase tracking-wider text-sm">ทำไมต้องเลือกเรา</h3>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">ฟีเจอร์ครบ จบในที่เดียว</h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-brand-400 to-brand-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    {icon: 'fa-bolt', title: 'Setup ไวใน 5 นาที', desc: 'ระบบอัตโนมัติ 100% สมัครปุ๊บ ได้ QR Code ปั๊บ ไม่ต้องรอเจ้าหน้าที่ติดต่อกลับ', color: 'text-brand-500', bg: 'group-hover:bg-brand-500', shadow: 'hover:shadow-brand-100/50'},
                    {icon: 'fa-money-bill-trend-up', title: 'เพิ่มยอดขายต่อโต๊ะ', desc: 'รูปภาพเมนูสวยงามชวนหิว กระตุ้นให้ลูกค้าสั่งอาหารเพิ่มขึ้นเฉลี่ย 20%', color: 'text-blue-600', bg: 'group-hover:bg-blue-600', shadow: 'hover:shadow-blue-100/50'},
                    {icon: 'fa-chart-pie', title: 'ข้อมูลเชิงลึก', desc: 'Dashboard สรุปยอดขาย เมนูขายดี ช่วงเวลาพีค ช่วยวางแผนสต็อกวัตถุดิบแม่นยำ', color: 'text-cyan-500', bg: 'group-hover:bg-cyan-500', shadow: 'hover:shadow-cyan-100/50'}
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
      <section id="howitworks" className="py-24 bg-brand-50/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white to-transparent opacity-60 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-20 reveal">
                <h3 className="text-brand-500 font-bold mb-2 uppercase tracking-wider text-sm">Easy Step</h3>
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
                        <div className="w-20 h-20 bg-white border-4 border-white shadow-xl shadow-brand-100 rounded-full flex items-center justify-center text-3xl text-brand-500 mb-8 z-10 relative group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <i className={`fa-solid ${step.icon}`}></i>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-500 rounded-full text-white text-base font-bold flex items-center justify-center border-2 border-white">{idx + 1}</div>
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-100 rounded-full blur-[120px] opacity-40 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-40 translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="reveal text-center mb-16">
                <h3 className="text-brand-500 font-bold mb-3 uppercase tracking-[0.2em] text-sm">Get Started</h3>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                    สมัครง่าย<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">เข้าใช้งานได้ทันที</span>
                </h2>
                <p className="mt-6 text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    หากสมัครเสร็จ ให้ทำการเพิ่มข้อมูลร้านเพื่อใช้งานระบบแบบมีประสิทธฺิภาพ
                </p>
            </div>

            <div className="reveal delay-100 grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-5 space-y-4">
                    {[
                        {icon: 'fa-bolt-lightning', color: 'text-green-500', bg: 'bg-green-50', title: 'Zero Setup', desc: 'ระบบถูกตั้งค่าไว้ให้พร้อมลอง ไม่ต้องกรอกข้อมูลส่วนตัว'},
                        {icon: 'fa-mobile-screen-button', color: 'text-blue-500', bg: 'bg-blue-50', title: 'Real Dashboard', desc: 'จัดการเมนู ดูออเดอร์ และสรุปยอดขายได้แบบ Real-time'},
                        {icon: 'fa-wand-magic-sparkles', color: 'text-purple-500', bg: 'bg-purple-50', title: 'Full Features', desc: 'ลองใช้ระบบหลังบ้าน (Backstore) ได้ครบทุกฟังก์ชัน'}
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
                    <div className="cta-box p-8 md:p-12 rounded-[2.5rem] text-center relative overflow-hidden shadow-2xl shadow-brand-500/10 group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className="mb-8 flex justify-center">
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-5xl text-brand-500 shadow-xl border border-slate-50 animate-float">
                                    <i className="fa-solid fa-rocket"></i>
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">พร้อมลุยแล้วหรือยัง?</h3>
                            <p className="text-slate-500 mb-10">กดปุ่มด้านล่างเพื่อเข้าสู่ระบบทดได้ทันที</p>

                            {/* ✅ แก้ลิงก์ปุ่ม CTA ด้านล่าง */}
                            <Link 
                                href="/login"
                                className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-black py-6 rounded-2xl text-2xl shadow-2xl shadow-brand-500/40 transform transition-all hover:scale-[1.03] active:scale-95 duration-200 flex items-center justify-center gap-4 relative overflow-hidden group/btn">
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:animate-shine"></span>
                                สมัครใช้งานฟรี
                                <i className="fa-solid fa-chevron-right text-lg group-hover/btn:translate-x-2 transition-transform"></i>
                            </Link>
                            
                            <div className="mt-6 flex items-center justify-center gap-6">
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <i className="fa-solid fa-shield-check text-green-500"></i> No Credit Card
                                </span>
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <i className="fa-solid fa-bolt text-brand-500"></i> Instant Set Up
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 text-slate-500 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold tracking-wider text-slate-800 flex items-center gap-2">
                 <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-brand-500/20">
                    <i className="fa-solid fa-qrcode"></i>
                </div>
                Quick<span className="text-brand-500">Order</span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
                <a href="#" className="hover:text-brand-500 transition-colors">คู่มือการใช้งาน</a>
                <a href="#" className="hover:text-brand-500 transition-colors">เงื่อนไขการบริการ</a>
                <a href="#" className="hover:text-brand-500 transition-colors">ความเป็นส่วนตัว</a>
                {/* ✅ เพิ่มลิงก์เข้าสู่ระบบตรง Footer */}
                <Link href="/login" className="hover:text-brand-500 transition-colors">เข้าสู่ระบบ (Login)</Link>
            </div>
            <div className="text-sm">
                &copy; 2024 QuickOrder. Made with <i className="fa-solid fa-heart text-red-500 mx-1"></i> in Thailand.
            </div>
        </div>
      </footer>
    </div>
  );
}