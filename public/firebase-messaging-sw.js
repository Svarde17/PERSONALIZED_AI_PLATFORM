// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase config (you'll need to add your config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "personalizedadvisorysystem.firebaseapp.com",
  projectId: "personalizedadvisorysystem",
  storageBucket: "personalizedadvisorysystem.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'farming-reminder',
    data: payload.data,
    actions: [
      {
        action: 'mark-done',
        title: 'Mark as Done'
      },
      {
        action: 'view-calendar',
        title: 'View Calendar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'mark-done') {
    // Handle mark as done action
    event.waitUntil(
      fetch('/api/calendar/task/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: event.notification.data.farmerId,
          taskWeek: event.notification.data.taskWeek
        })
      })
    );
  } else if (event.action === 'view-calendar') {
    // Open calendar page
    event.waitUntil(
      clients.openWindow('/calendar')
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});