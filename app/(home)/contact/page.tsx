import Image from 'next/image';
import { FaFacebookF, FaLine, FaPhoneAlt, FaQuoteLeft, FaCheckCircle } from 'react-icons/fa';

export default function ContactPage() {
  return (
    // เว้นระยะด้านบนเผื่อ Navbar
    <main className="min-h-screen bg-[#F8F9FD] font-anuphan pt-28 pb-20">
      
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 drop-shadow-sm">
            ติดต่อเรา
          </h1>
          <p className="text-slate-500 text-lg font-light">
            เราพร้อมดูแลคุณดุจญาติมิตร ด้วยระบบที่สร้างมาจาก <span className="text-red-500 font-bold">"หัวใจ"</span>
          </p>
        </div>

        {/* Super Content Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white overflow-hidden max-w-6xl mx-auto relative">
          
          {/* Decorative Background Blur */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-50"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] opacity-50"></div>
          </div>

          <div className="flex flex-col md:flex-row relative z-10">
            
            {/* ฝั่งซ้าย: THE CEO (โหมดเล่นใหญ่) */}
            <div className="md:w-5/12 bg-gradient-to-b from-blue-50/80 to-white p-12 flex flex-col items-center text-center relative border-b md:border-b-0 md:border-r border-blue-50">
              
              {/* Profile Image with Aura */}
              <div className="relative w-56 h-56 mb-8 group cursor-pointer">
                {/* Rotating Rings */}
                <div className="absolute inset-[-12px] border-2 border-dashed border-blue-200 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-[-4px] bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full animate-pulse blur-sm"></div>
                
                <Image
                  src="/images/ceo.jpg" // *** รูปเดิม ***
                  alt="Worathon Namthong"
                  fill
                  className="rounded-full object-cover border-[6px] border-white shadow-2xl relative z-10 transform group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Verified Badge */}
                <div className="absolute bottom-2 right-2 z-20 bg-blue-600 text-white p-2 rounded-full border-4 border-white shadow-lg">
                  <FaCheckCircle className="text-xl" />
                </div>
              </div>
              
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                คุณวรธน นำทอง
              </h2>
              <div className="mt-3 inline-flex items-center space-x-2 bg-blue-100/50 px-4 py-1.5 rounded-full border border-blue-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-blue-700 text-xs font-bold uppercase tracking-widest">
                  CEO & Visionary Founder
                </span>
              </div>
              
              {/* Quote แบบเล่นใหญ่ */}
              <div className="mt-8 relative">
                <FaQuoteLeft className="absolute -top-4 -left-2 text-blue-100 text-4xl" />
                <p className="text-slate-700 text-base leading-relaxed font-medium italic relative z-10">
                  "ผมไม่ได้แค่เขียนโปรแกรม... <br/>
                  <span className="text-indigo-600 font-bold bg-indigo-50 px-1">แต่ผมเดิมพันด้วยชีวิต!</span> <br/>
                  POS-FoodScan คือจิตวิญญาณของผม ผมทุ่มเทสร้างมันขึ้นมาเพื่อให้เป็น <span className="text-blue-600 font-bold">The Best POS</span> ที่จะเปลี่ยนโลกธุรกิจร้านอาหารของคุณไปตลอดกาล!"
                </p>
              </div>

              {/* Signature (Fake visual signature) */}
              <div className="mt-8 text-slate-300 font-serif text-4xl opacity-50 rotate-[-5deg]">
                Worathon N.
              </div>
            </div>

            {/* ฝั่งขวา: Contact Info (ทันสมัย น่ากด) */}
            <div className="md:w-7/12 p-12 flex flex-col justify-center bg-white/60 backdrop-blur-sm">
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  ช่องทางการติดต่อ
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </h3>
                <p className="text-slate-500 text-sm mt-2">ติดต่อผมโดยตรงได้ทุกช่องทาง ยินดีให้บริการระดับ VVIP ครับ</p>
              </div>

              <div className="grid gap-6">
                {/* Facebook Card */}
                <a
                  href="https://www.facebook.com/worathon.namthong.2025/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-500/30 hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.2)] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1877F2] to-[#0b5fc9] rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
                    <FaFacebookF />
                  </div>
                  <div className="ml-6 flex-1">
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wide mb-1">Facebook ส่วนตัว</p>
                    <p className="text-slate-800 font-bold text-xl group-hover:text-[#1877F2] transition-colors">
                      วรธน นำทอง
                    </p>
                  </div>
                  <div className="text-slate-300 group-hover:text-blue-500 transition-colors">➔</div>
                </a>

                {/* Line Card */}
                <a
                  href="https://line.me/ti/p/~bs_boll"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center p-5 rounded-2xl border border-slate-100 bg-white hover:border-green-500/30 hover:shadow-[0_10px_40px_-10px_rgba(22,163,74,0.2)] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#06C755] to-[#04a044] rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-green-200 group-hover:rotate-6 transition-transform">
                    <FaLine />
                  </div>
                  <div className="ml-6 flex-1">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">Line Official / ID</p>
                    <p className="text-slate-800 font-bold text-xl group-hover:text-[#06C755] transition-colors">
                      bs_boll
                    </p>
                  </div>
                  <div className="text-slate-300 group-hover:text-green-500 transition-colors">➔</div>
                </a>

                {/* Phone Card */}
                <a
                  href="tel:0997547764"
                  className="group flex items-center p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-800/30 hover:shadow-[0_10px_40px_-10px_rgba(30,41,59,0.2)] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-slate-200 group-hover:rotate-6 transition-transform">
                    <FaPhoneAlt />
                  </div>
                  <div className="ml-6 flex-1">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">สายด่วน CEO</p>
                    <p className="text-slate-800 font-bold text-xl group-hover:text-slate-900 transition-colors">
                      099-754-7764
                    </p>
                  </div>
                  <div className="text-slate-300 group-hover:text-slate-700 transition-colors">➔</div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}