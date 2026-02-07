import { useState, useEffect, useMemo } from 'react';
import { 
    getInitialDataAction, 
    upsertDiscountAction, 
    deleteDiscountAction 
} from '@/app/actions/discountActions';
// ✅ 1. Import Hook ตัว Alert มาใช้
import { useGlobalAlert } from '@/components/providers/GlobalAlertProvider';

export function useDiscounts() {
  const { showAlert, showConfirm } = useGlobalAlert(); // ✅ 2. ดึงฟังก์ชันออกมา

  // Data States
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(0);
  const [applyTo, setApplyTo] = useState<'all' | 'specific'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [applyPriceNormal, setApplyPriceNormal] = useState(true);
  const [applyPriceSpecial, setApplyPriceSpecial] = useState(true);
  const [applyPriceJumbo, setApplyPriceJumbo] = useState(true);

  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState('ALL');

  // --- Init ---
  const fetchAllData = async () => {
    setLoading(true);
    const res = await getInitialDataAction();
    if (res.success) {
        setBrandId(res.brandId!);
        setDiscounts(res.discounts || []);
        setProducts(res.products || []);
        setCategories(res.categories || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Handlers ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        id: editingId,
        name, type, value, apply_to: applyTo,
        apply_normal: applyPriceNormal,
        apply_special: applyPriceSpecial,
        apply_jumbo: applyPriceJumbo,
        start_date: startDate,
        end_date: endDate
      };

      const res = await upsertDiscountAction(payload, selectedProductIds);
      
      if (!res.success) throw new Error(res.error);

      closeModal();
      
      // ✅ 3. ใช้ showAlert แทน alert ธรรมดา
      showAlert('success', 'บันทึกสำเร็จ', 'โปรโมชันของคุณได้รับการอัปเดตเรียบร้อยแล้ว');

      const refreshRes = await getInitialDataAction();
      if (refreshRes.success) setDiscounts(refreshRes.discounts || []);

    } catch (err: any) {
      // ✅ 4. แสดง Error แบบสวยๆ
      showAlert('error', 'เกิดข้อผิดพลาด', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
      // ✅ 5. ใช้ showConfirm แทน confirm ธรรมดา (สวยและได้มาตรฐาน)
      const isConfirmed = await showConfirm(
    'ยืนยันการลบเมนู?',
    'คุณต้องการลบรายการนี้ใช่หรือไม่?',
    'ลบทิ้ง',
    'ยกเลิก',
    'error' // ✅ ใส่ตรงนี้เพื่อให้ไอคอนเปลี่ยนเป็นถังขยะสีแดง
);

      if(!isConfirmed) return;
      
      // Optimistic update
      const oldDiscounts = [...discounts];
      setDiscounts(prev => prev.filter(d => d.id !== id));

      const res = await deleteDiscountAction(id);
      if (!res.success) {
          // ✅ 6. แจ้งเตือนถ้าลบไม่สำเร็จ
          showAlert('error', 'ลบไม่สำเร็จ', res.error || 'กรุณาลองใหม่อีกครั้ง');
          setDiscounts(oldDiscounts); // Revert
      } else {
          showAlert('success', 'ลบเรียบร้อย', 'โปรโมชันถูกนำออกจากระบบแล้ว');
      }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setSelectedProductIds([]);
    setApplyTo('all');
    setStartDate('');
    setEndDate('');
    setValue(0);
    setType('percentage');
    setApplyPriceNormal(true);
    setApplyPriceSpecial(true);
    setApplyPriceJumbo(true);
  };

  const filteredProductsForModal = useMemo(() => {
    return products.filter((p: any) => {
      const matchSearch = p.name.toLowerCase().includes(modalSearch.toLowerCase());
      const matchCat = modalCategory === 'ALL' || p.category_id === modalCategory;
      return matchSearch && matchCat;
    });
  }, [products, modalSearch, modalCategory]);

  return {
    discounts, products, categories, loading, brandId,
    isModalOpen, setIsModalOpen, isSubmitting, editingId,
    name, setName, type, setType, value, setValue,
    applyTo, setApplyTo, selectedProductIds, setSelectedProductIds,
    startDate, setStartDate, endDate, setEndDate,
    applyPriceNormal, setApplyPriceNormal,
    applyPriceSpecial, setApplyPriceSpecial,
    applyPriceJumbo, setApplyPriceJumbo,
    modalSearch, setModalSearch, modalCategory, setModalCategory,
    filteredProductsForModal,
    handleSubmit, closeModal, handleDelete
  };
}