// app/[slug]/[brandId]/table/[tableId]/page.tsx
"use client";

import React from "react";
import { useShopLogic } from "../../../../../hooks/useShopLogic"; 

import StandardTheme from "@/components/themes/StandardTheme";
import LuxuryTheme from "@/components/themes/LuxuryTheme";
import Scooby from "@/components/themes/Scooby"
import CampLazlo from "@/components/themes/CampLazlo"
import Ralph from "@/components/themes/Ralph"
import PeterPan from "@/components/themes/PeterPan"
import FlapjackStomarong from "@/components/themes/FlapjackStomarong"
import Pinkie from "@/components/themes/Pinkie"
import TomJerry from "@/components/themes/TomJerry"
import BabyLooney from "@/components/themes/BabyLooney"
import FosterHome from "@/components/themes/FosterHome"
import OnePiece from "@/components/themes/OnePiece"
import Garfield from "@/components/themes/Garfield"
import GarfieldNeon from "@/components/themes/GarfieldNeon"
import Moana from "@/components/themes/Moana"
import Motunui from "@/components/themes/Motunui"
import SpringFreshBloom from "@/components/themes/SpringFreshBloom"
import Christmas from "@/components/themes/Christmas"
import Halloween from "@/components/themes/Halloween"
import Sketchbook from "@/components/themes/Sketchbook"
import TheCroods from "@/components/themes/TheCroods"
import PeterPanNeverland from "@/components/themes/PeterPanNeverland"
import WeBareBares from "@/components/themes/WeBareBares"
import AdventureTime from "@/components/themes/AdventureTime"
import JohnnyTest from "@/components/themes/JohnnyTest"
import KryptoHeroic from "@/components/themes/KryptoHeroic"
import PinkPanther from "@/components/themes/PinkPanther"
import TheDukesof from "@/components/themes/TheDukesof"
import TheLionKing from "@/components/themes/TheLionKing"
import JuniperLee from "@/components/themes/JuniperLee"
import CowandChicken from "@/components/themes/CowandChicken"
import CowandChicV2 from "@/components/themes/CowandChicV2"
import MickeyMouse from "@/components/themes/MickeyMouse"
import PowerpuffGirls from "@/components/themes/PowerpuffGirls"
import CourageKitchen from "@/components/themes/CourageKitchen"
import MashaBear from "@/components/themes/MashaBear"
import SAO from "@/components/themes/SAO"
import KrustyKrab from "@/components/themes/KrustyKrab"
import RaftSurvival from "@/components/themes/RaftSurvival"
import HomeforImaginary from "@/components/themes/HomeforImaginary"
import StrawberryCheesecake from "@/components/themes/StrawberryCheesecake"
import BabyBug from "@/components/themes/ฺBabyBug"
import Tom from "@/components/themes/Tom"
import CampLazloo from "@/components/themes/CampLazloo"
import SugarcubeCorner from "@/components/themes/SugarcubeCorner"
import MarvelousCandy from "@/components/themes/MarvelousCandy"
import OggyKitchen from "@/components/themes/OggyKitchen"
import Scoobpydoo from "@/components/themes/Scoobpydoo"
import Omnitrix from "@/components/themes/Omnitrix"
import CourtSideEats from "@/components/themes/CourtSideEats"
import StadiumEats from "@/components/themes/StadiumEats"
import PremiumBlue from "@/components/themes/PremiumBlue"
import WarmSavoryOrange from "@/components/themes/WarmSavoryOrange"
import MinimalEarth from "@/components/themes/MinimalEarth"
import DarkLuxury from "@/components/themes/DarkLuxury"
import LeafGreen from "@/components/themes/LeafGreen"
import CozyWood from "@/components/themes/CozyWood"

// 🌟 1. ประกาศ URL ของ Cloudflare ตรงนี้
const CDN_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://img.pos-foodscan.com";

export default function Page({ params }: { params: any }) {

  // ดึง state และ actions มาตามปกติ
  const { state, actions, helpers: originalHelpers } = useShopLogic(params);
  
  const { loading, error, brand } = state;

  // 🌟 2. ดัดแปลง (Override) Helpers เดิมที่มาจาก Hook เพื่อให้รองรับ Cloudflare
  // วิธีนี้จะทำให้ทั้ง 50 ธีมที่เรียกใช้ getMenuUrl หรือ getBannerUrl ได้ลิงก์ใหม่ทันที
  const helpers = {
      ...originalHelpers, // เอาฟังก์ชันอื่นๆ (เช่น calculatePrice) มาใช้เหมือนเดิม
      getMenuUrl: (imageName: string | null) => {
          if (!imageName) return '/placeholder-food.png'; // ถ้าร้านไม่ได้ใส่รูป
          if (imageName.startsWith('http')) return imageName;
          return `${CDN_URL}/${imageName}`; // ดึงจาก Cloudflare
      },
      getBannerUrl: (imageName: string | null) => {
          if (!imageName) return '/placeholder-banner.png'; 
          if (imageName.startsWith('http')) return imageName;
          return `${CDN_URL}/${imageName}`; // ดึงจาก Cloudflare
      }
  };


  if (error) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-600 font-bold p-10">
          ❌ Error: {error}
       </div>
     );
  }

  if (loading || !brand) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-400 font-bold animate-pulse">
           กำลังโหลดร้านค้า...
        </div>
      );
  }

  const themeMode = brand.theme_mode || 'standard';

  // 🌟 3. ส่ง helpers ตัวใหม่ (ที่ดัดแปลงแล้ว) ลงไปให้ทุกธีม!
  switch (themeMode) {
    case 'luxury': return <LuxuryTheme state={state} actions={actions} helpers={helpers} />;
    case 'scoopydo': return <Scooby state={state} actions={actions} helpers={helpers} />;
    case 'camplazlo': return <CampLazlo state={state} actions={actions} helpers={helpers} />;
    case 'ralph': return <Ralph state={state} actions={actions} helpers={helpers} />;
    case 'peterpan': return <PeterPan state={state} actions={actions} helpers={helpers} />;
    case 'flapjack': return <FlapjackStomarong state={state} actions={actions} helpers={helpers} />;
    case 'pinkie': return <Pinkie state={state} actions={actions} helpers={helpers} />;
    case 'tomjerry': return <TomJerry state={state} actions={actions} helpers={helpers} />;
    case 'babylooney': return <BabyLooney state={state} actions={actions} helpers={helpers} />;
    case 'fosterhome': return <FosterHome state={state} actions={actions} helpers={helpers} />;
    case 'onepiece': return <OnePiece state={state} actions={actions} helpers={helpers} />;
    case 'darkgarfield': return <Garfield state={state} actions={actions} helpers={helpers} />;
    case 'garfieldneon': return <GarfieldNeon state={state} actions={actions} helpers={helpers} />;
    case 'moana': return <Moana state={state} actions={actions} helpers={helpers} />;
    case 'motunui': return <Motunui state={state} actions={actions} helpers={helpers} />;
    case 'springsreshbloom': return <SpringFreshBloom state={state} actions={actions} helpers={helpers} />;
    case 'christmas': return <Christmas state={state} actions={actions} helpers={helpers} />;
    case 'halloween': return <Halloween state={state} actions={actions} helpers={helpers} />;
    case 'sketchbook': return <Sketchbook state={state} actions={actions} helpers={helpers} />;
    case 'thecroods': return <TheCroods state={state} actions={actions} helpers={helpers} />;     
    case 'peterpanneverland': return <PeterPanNeverland state={state} actions={actions} helpers={helpers} />;
    case 'webarebares': return <WeBareBares state={state} actions={actions} helpers={helpers} />;
    case 'adventuretime': return <AdventureTime state={state} actions={actions} helpers={helpers} />;
    case 'johnnytest': return <JohnnyTest state={state} actions={actions} helpers={helpers} />;
    case 'kryptoheroic': return <KryptoHeroic state={state} actions={actions} helpers={helpers} />;
    case 'pinkpanther': return <PinkPanther state={state} actions={actions} helpers={helpers} />;
    case 'thedukesof': return <TheDukesof state={state} actions={actions} helpers={helpers} />;
    case 'thelionking': return <TheLionKing state={state} actions={actions} helpers={helpers} />;
    case 'juniperlee': return <JuniperLee state={state} actions={actions} helpers={helpers} />;
    case 'cowandchicken': return <CowandChicken state={state} actions={actions} helpers={helpers} />;
    case 'cowandchicv': return <CowandChicV2 state={state} actions={actions} helpers={helpers} />;
    case 'mickeymouse': return <MickeyMouse state={state} actions={actions} helpers={helpers} />;
    case 'powerpuffgirls': return <PowerpuffGirls state={state} actions={actions} helpers={helpers} />;
    case 'couragekitchen': return <CourageKitchen state={state} actions={actions} helpers={helpers} />;
    case 'mashabear': return <MashaBear state={state} actions={actions} helpers={helpers} />;
    case 'sao': return <SAO state={state} actions={actions} helpers={helpers} />;
    case 'krustykrab': return <KrustyKrab state={state} actions={actions} helpers={helpers} />;
    case 'raftsurvival': return <RaftSurvival state={state} actions={actions} helpers={helpers} />;
    case 'homeforimaginary': return <HomeforImaginary state={state} actions={actions} helpers={helpers} />;
    case 'strawberrycheesecake': return <StrawberryCheesecake state={state} actions={actions} helpers={helpers} />;
    case 'bebybug': return <BabyBug state={state} actions={actions} helpers={helpers} />;
    case 'tom': return <Tom state={state} actions={actions} helpers={helpers} />;
    case 'camplazloo': return <CampLazloo state={state} actions={actions} helpers={helpers} />;
    case 'sugarcubecorner': return <SugarcubeCorner state={state} actions={actions} helpers={helpers} />;
    case 'marvelouscandy': return <MarvelousCandy state={state} actions={actions} helpers={helpers} />;
    case 'oggykitchen': return <OggyKitchen state={state} actions={actions} helpers={helpers} />;
    case 'scoobpydoo': return <Scoobpydoo state={state} actions={actions} helpers={helpers} />;
    case 'omnitrix': return <Omnitrix state={state} actions={actions} helpers={helpers} />;
    case 'basketball': return <CourtSideEats state={state} actions={actions} helpers={helpers} />;
    case 'football': return <StadiumEats state={state} actions={actions} helpers={helpers} />;
    case 'blue': return <PremiumBlue state={state} actions={actions} helpers={helpers} />;
    case 'warmsavory': return <WarmSavoryOrange state={state} actions={actions} helpers={helpers} />;
    case 'mkinimalearth': return <MinimalEarth state={state} actions={actions} helpers={helpers} />;
    case 'darkluxury': return <DarkLuxury state={state} actions={actions} helpers={helpers} />;
    case 'leafgreen': return <LeafGreen state={state} actions={actions} helpers={helpers} />;
    case 'cozywood': return <CozyWood state={state} actions={actions} helpers={helpers} />;
    case 'standard':
    default:
        return <StandardTheme state={state} actions={actions} helpers={helpers} />;
  }
}