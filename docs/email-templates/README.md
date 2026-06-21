# Supabase Auth redirects

นำ HTML สองไฟล์ไปวางที่ Supabase Dashboard → Authentication → Email Templates

เพิ่ม Redirect URLs ต่อไปนี้ใน Authentication → URL Configuration:

- `com.suparpos.app://login-callback/`
- `com.suparpos.app://login-callback/**`
- `https://www.pos-foodscan.com/auth/callback`

`{{ .ConfirmationURL }}` จะพาผู้ใช้ไปถูกปลายทางเอง เพราะผู้ร้องขอส่ง `redirectTo` ต่างกัน:

- แอปส่ง `source: app` และใช้ custom scheme ของ SuparPOS
- เว็บไม่ส่ง `source` และใช้ `/auth/callback`
