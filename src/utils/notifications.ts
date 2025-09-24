// Notification utility functions
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return 'granted';
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Subscribe farmer to notifications
export const subscribeToNotifications = async (farmerId: string): Promise<boolean> => {
  try {
    const permission = await requestNotificationPermission();
    
    if (!permission) return false;

    const response = await fetch('http://localhost:5000/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId, fcmToken: 'web-token' })
    });

    return response.ok;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return false;
  }
};

// Send test notification
export const sendTestNotification = async (farmerId: string) => {
  try {
    const response = await fetch('http://localhost:5000/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmerId,
        title: '🌾 Test Farming Reminder',
        body: 'This is a test notification for your crop calendar',
        data: { test: 'true' }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

// Show browser notification
export const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'farming-reminder'
    });
  }
};