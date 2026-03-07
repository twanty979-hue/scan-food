importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA49mwPZNClHAj5meHIigTGBSaMjMYys48",
  authDomain: "pos-foodscan.firebaseapp.com",
  projectId: "pos-foodscan",
  storageBucket: "pos-foodscan.firebasestorage.app",
  messagingSenderId: "690225929026",
  appId: "1:690225929026:web:ae0c1dd05ed413a60386db"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] ได้รับออเดอร์ตอนปิดจอ:', payload);
  const notificationTitle = payload.notification?.title || 'มีออเดอร์ใหม่!';
  const notificationOptions = {
    body: payload.notification?.body || 'กรุณาตรวจสอบระบบ POS',
    icon: '/favicon.ico', // เปลี่ยนเป็นโลโก้ร้านพี่ได้ถ้ามีไฟล์รูปใน public
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});