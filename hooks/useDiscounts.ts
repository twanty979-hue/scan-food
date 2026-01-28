// hooks/useDiscounts.ts
import { useState, useEffect, useMemo } from 'react';
import { 
    getInitialDataAction, 
    upsertDiscountAction, 
    deleteDiscountAction 
} from '@/app/actions/discountActions';

export function useDiscounts() {
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
      // Refresh discounts only (in this simpler implementation we re-fetch all for consistency)
      const refreshRes = await getInitialDataAction();
      if (refreshRes.success) setDiscounts(refreshRes.discounts || []);

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm('ยืนยันลบโปรโมชันนี้?')) return;
      
      // Optimistic update
      const oldDiscounts = [...discounts];
      setDiscounts(prev => prev.filter(d => d.id !== id));

      const res = await deleteDiscountAction(id);
      if (!res.success) {
          alert("Error deleting: " + res.error);
          setDiscounts(oldDiscounts); // Revert
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
    // Reset defaults
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