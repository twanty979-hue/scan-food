// hooks/useProfile.ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // Client for Storage
import { getProfileDataAction, updateProfileAction } from '@/app/actions/profileActions';
import { useRouter } from 'next/navigation';

// Config
const CDN_URL = "https://xvhibjejvbriotfpunvv.supabase.co/storage/v1/object/public/avatars/";

export function useProfile() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        avatar_url: '',
        role: ''
    });

    // --- Init ---
    useEffect(() => {
        const init = async () => {
            const res = await getProfileDataAction();
            if (res.success) {
                setUserId(res.user.id);
                setEmail(res.user.email || '');
                if (res.profile) {
                    setFormData({
                        full_name: res.profile.full_name || '',
                        phone: res.profile.phone || '',
                        avatar_url: res.profile.avatar_url || '',
                        role: res.profile.role || 'staff'
                    });
                }
            } else {
                router.replace('/login');
            }
            setLoading(false);
        };
        init();
    }, [router]);

    // --- Helpers ---
    const getImageUrl = (imageName: string | null) => {
        if (!imageName) return null;
        if (imageName.startsWith('http')) return imageName;
        return `${CDN_URL}${imageName}`;
    };

    // --- Handlers ---

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !userId) return;
        
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        try {
            setSubmitting(true);
            
            // Upload to Storage (Client Side)
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
            if (uploadError) throw uploadError;

            // Update State & DB
            setFormData(prev => ({ ...prev, avatar_url: fileName }));
            await updateProfileAction(userId, { avatar_url: fileName });

        } catch (err: any) {
            alert('Upload Error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setSubmitting(true);
        try {
            const res = await updateProfileAction(userId, {
                full_name: formData.full_name,
                phone: formData.phone
            });

            if (res.success) {
                alert('บันทึกข้อมูลเรียบร้อยแล้ว! ✅');
            } else {
                throw new Error(res.error);
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        loading, submitting, userId, email,
        formData, setFormData,
        fileInputRef,
        getImageUrl, handleUpload, handleSave
    };
}