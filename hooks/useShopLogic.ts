// hooks/useShopLogic.ts
import { useState, useEffect, useMemo, useCallback, use } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";
import { fetchShopData, submitOrder } from "@/app/actions/shop";

// Config
const CDN_MENU_URL = "https://xvhibjejvbriotfpunvv.supabase.co/storage/v1/object/public/menus/";
const CDN_BANNER_URL = "https://xvhibjejvbriotfpunvv.supabase.co/storage/v1/object/public/banners/";

const roundToQuarter = (value: number) => Math.round(value * 4) / 4;

export const useShopLogic = (params: any) => {
  const router = useRouter();
  
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { slug: currentSlug, brandId, tableId: combinedId } = resolvedParams || {};

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  
  // Data States
  const [brand, setBrand] = useState<any>(null);
  const [tableLabel, setTableLabel] = useState("");
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  
  // Cart & UI States
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [cart, setCart] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // --- Computed ---
  const realTableId = useMemo(() => combinedId?.substring(0, 36), [combinedId]);
  const providedCode = useMemo(() => combinedId?.substring(36), [combinedId]);

  const kickOut = useCallback((reason: string) => {
    console.warn(`🚫 Kickout triggered: ${reason}`);
    setError(reason);
    setLoading(false);
  }, []);

  const getMenuUrl = (imageName: string) => imageName ? (imageName.startsWith('http') ? imageName : `${CDN_MENU_URL}${brandId}/${imageName}`) : null;
  const getBannerUrl = (imageName: string) => imageName ? (imageName.startsWith('http') ? imageName : `${CDN_BANNER_URL}${brandId}/${imageName}`) : null;

  // =========================================================================
  // 🔥 ฟังก์ชันพระเอก V4: กรองบิลยกเลิกทิ้ง + ตัดราคาเมนูย่อยเหลือ 0
  // =========================================================================
  const transformOrdersForDisplay = useCallback((orders: any[]) => {
    if (!orders || !Array.isArray(orders)) return [];

    // ✅ 1. กรองบิลที่สถานะเป็น 'cancelled' ทิ้งไปเลย (ไม่ต้องโผล่หัวมา)
    const activeOrders = orders.filter(order => order.status !== 'cancelled');

    return activeOrders.map(order => {
      // 2. แปลงร่างรายการอาหารย่อย (ถ้า Cancel -> แก้ชื่อ และแก้ราคาเป็น 0)
      const transformedItems = (order.order_items || []).map((item: any) => {
        if (item.status === 'cancelled') {
          return {
            ...item,
            product_name: `❌ [ยกเลิก] ${item.product_name}`,
            // บังคับราคาเป็น 0 เพื่อให้สูตรคำนวณในธีม ไม่เอายอดนี้ไปบวก
            price: 0 
          };
        }
        return item;
      });

      // 3. คำนวณราคารวมของบิลนี้ใหม่ (จาก item ที่ราคาโดนแก้แล้ว)
      const newTotalPrice = transformedItems.reduce((sum: number, item: any) => {
        return sum + (Number(item.price) * Number(item.quantity));
      }, 0);

      // 4. ส่งข้อมูลชุดใหม่กลับไป
      return {
        ...order,
        total_price: newTotalPrice, 
        order_items: transformedItems
      };
    });
  }, []);
  // =========================================================================

  // --- Pricing Logic ---
  const calculatePrice = useCallback((product: any, variant = 'normal') => {
    let basePrice = product.price;
    if (variant === 'special') basePrice = product.price_special || product.price;
    if (variant === 'jumbo') basePrice = product.price_jumbo || product.price;

    const now = new Date();
    const applicableDiscounts = discounts.filter(d => {
      const isTimeValid = (!d.start_date || new Date(d.start_date) <= now) && (!d.end_date || new Date(d.end_date) >= now);
      if (!isTimeValid) return false;
      if (variant === 'normal' && !d.apply_normal) return false;
      if (variant === 'special' && !d.apply_special) return false;
      if (variant === 'jumbo' && !d.apply_jumbo) return false;
      if (d.apply_to === 'all') return true;
      if (d.apply_to === 'specific') return d.discount_products?.some((dp:any) => dp.product_id === product.id);
      return false;
    });

    const roundedOriginal = roundToQuarter(basePrice);
    if (applicableDiscounts.length === 0) {
      return { original: roundedOriginal, final: roundedOriginal, discount: 0 };
    }

    const discountResults = applicableDiscounts.map(d => {
      let final = basePrice;
      if (d.type === 'percentage') final = basePrice - (basePrice * d.value / 100);
      else if (d.type === 'fixed') final = basePrice - d.value;
      return Math.max(0, final);
    });

    const bestPrice = Math.min(...discountResults);
    const roundedFinal = roundToQuarter(bestPrice);

    return { 
      original: roundedOriginal, 
      final: roundedFinal, 
      discount: Math.max(0, roundedOriginal - roundedFinal) 
    };
  }, [discounts]);

  // --- Initialize Effect ---
  useEffect(() => {
    let isMounted = true; 
    
    async function init() {
      if (!brandId || !combinedId || !realTableId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetchShopData({ 
          brandId, 
          combinedId, 
          slug: decodeURIComponent(currentSlug || '') 
        });

        if (!isMounted) return;

        if (!res.success || !res.data) {
          if (res.redirect) {
             window.location.href = res.redirect;
          } else {
             kickOut(res.error || "Access Denied");
          }
          return;
        }

        const d = res.data;
        
        setBrand(d.brand);
        setTableLabel(d.tableLabel);
        setBanners(d.banners || []);
        setCategories(d.categories || []);
        setProducts(d.products || []);
        setDiscounts(d.discounts || []);
        
        // ✅ จุดที่ 1: ย้อมแมวตอนโหลดครั้งแรก
        setOrdersList(transformOrdersForDisplay(d.orders || [])); 
        
        setIsVerified(true);
        setLoading(false);
      } catch (err) {
        console.error("Init Error:", err);
        kickOut("Connection Error");
      }
    }

    init();
    return () => { isMounted = false; };
  }, [brandId, combinedId, realTableId, currentSlug, kickOut, transformOrdersForDisplay]);

  // --- Banner Interval ---
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // --- Realtime 1: Table Security Watcher ---
  useEffect(() => {
    if (!realTableId) return;
    const channel = supabase.channel(`table_guard_${realTableId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tables', filter: `id=eq.${realTableId}` }, (payload) => {
        if (payload.new.access_token !== providedCode) {
            window.location.href = "https://google.com";
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [realTableId, providedCode]);

  // =========================================================================
  // ✅ Realtime 2: Order Status Watcher
  // =========================================================================
  useEffect(() => {
    if (!realTableId || !brandId) return;

    const refreshOrders = async () => {
        const res = await fetchShopData({ 
            brandId, 
            combinedId, 
            slug: decodeURIComponent(currentSlug || '') 
        });
        
        if (res.success && res.data) {
            // ✅ จุดที่ 2: ย้อมแมวตอน Realtime มา
            setOrdersList(transformOrdersForDisplay(res.data.orders || []));
        }
    };

    const channel = supabase.channel(`customer_order_watch_${realTableId}`)
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `brand_id=eq.${brandId}` }, 
        (payload) => { refreshOrders(); }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'order_items' },
        (payload) => { refreshOrders(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [realTableId, brandId, combinedId, currentSlug, transformOrdersForDisplay]); 
  // =========================================================================


  // --- Cart Actions ---
  const handleAddToCart = (product: any, variant: any, note: string = "") => {
    const pricing = calculatePrice(product, variant);
    const cleanNote = note ? note.trim() : "";

    setCart(prev => {
        const existingIndex = prev.findIndex(i => 
            i.id === product.id && i.variant === variant && (i.note || "") === cleanNote 
        );

        if (existingIndex !== -1) {
            const newCart = [...prev];
            newCart[existingIndex] = {
                ...newCart[existingIndex],
                quantity: newCart[existingIndex].quantity + 1
            };
            return newCart;
        }

        return [...prev, { 
            ...product, 
            variant, 
            price: pricing.final,      
            original_price: pricing.original,
            discount: pricing.discount,       
            quantity: 1, 
            image_url: getMenuUrl(product.image_name),
            note: cleanNote 
        }];
    });
    setSelectedProduct(null);
  };

  const updateQuantity = (idx: number, delta: number) => {
    setCart(prev => {
        const newCart = [...prev];
        const newQuantity = newCart[idx].quantity + delta;
        
        if (newQuantity <= 0) {
            newCart.splice(idx, 1);
        } else {
            newCart[idx] = {
                ...newCart[idx],
                quantity: newQuantity
            };
        }
        return newCart;
    });
  };

  // --- Checkout Action ---
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      setLoading(true);
      
      const totalPrice = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

      const result = await submitOrder({
          brandId,
          combinedId,
          tableLabel,
          totalPrice,
          cart
      });

      if (!result.success) {
          throw new Error(result.error);
      }

      setCart([]);
      setActiveTab('status');
      
      // ✅ จุดที่ 3: ย้อมแมวตอนสั่งเสร็จ
      setOrdersList(transformOrdersForDisplay(result.orders || [])); 

    } catch (err: any) { 
        alert(`Failed to order: ${err.message}`); 
    } finally { 
        setLoading(false); 
    }
  };

  const filteredProducts = useMemo(() => selectedCategoryId === "all" ? products : products.filter((p: any) => p.category_id === selectedCategoryId), [products, selectedCategoryId]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  return {
    state: {
      loading, error, isVerified, activeTab, brand, tableLabel, banners, categories, 
      products, selectedCategoryId, cart, ordersList, currentBannerIndex, selectedProduct,
      filteredProducts, cartTotal
    },
    actions: {
      setActiveTab, setSelectedCategoryId, setSelectedProduct, 
      handleAddToCart, updateQuantity, handleCheckout
    },
    helpers: {
      getMenuUrl, getBannerUrl, calculatePrice
    }
  };
};