import { useState, useRef, useCallback } from "react";

const useNotification = () => {
  const [notification, setNotification] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const notificationSound = useRef(null);

  // Initialize Audio
  const initializeAudio = useCallback(() => {
    if (!notificationSound.current) {
      notificationSound.current = new Audio("/notification/notification.mp3");
      notificationSound.current.preload = "auto";
      notificationSound.current.load();
    }
  }, []);

  // Unlock audio (call this on first user interaction)
  const prepareSound = useCallback(() => {
    initializeAudio();

    // Unlock the sound (HTML5 Audio)
    if (notificationSound.current) {
      notificationSound.current.play()
        .then(() => {
          notificationSound.current.pause();
          notificationSound.current.currentTime = 0;
          setSoundEnabled(true);
          console.log("🔓 HTML5 Audio unlocked!");
        })
        .catch(err => console.warn("HTML5 Audio unlock failed:", err));
    }

    // Remove listeners after first unlock
    document.removeEventListener('click', prepareSound);
    document.removeEventListener('touchstart', prepareSound);
    document.removeEventListener('keydown', prepareSound);
  }, [initializeAudio]);

  // Play sound with fallback
  const playSound = useCallback(() => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play()
        .then(() => {
          console.log("🔊 Sound played via HTML5 Audio");
        })
        .catch(err => {
          console.warn("HTML5 Audio failed:", err);
        });
    }
  }, []);

  // Show notification with sound
  const notify = useCallback((message, duration = 5000) => {
    setNotification(message);
    playSound();

    // If browser notifications are enabled, trigger them (optional)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("New Order!", {
        body: message,
        icon: "/logo.png",
        badge: "/logo.png",
        tag: "order-notification",
        requireInteraction: false,
      });
    }

    // Auto-clear notification after duration
    if (duration) {
      setTimeout(() => setNotification(null), duration);
    }
  }, [playSound]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
        return permission === "granted";
      } catch (err) {
        console.warn("Notification permission error:", err);
        return false;
      }
    }
    return Notification.permission === "granted";
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Initialize on mount
  useState(() => {
    initializeAudio();
    
    // Auto-attach unlock listeners
    const attachUnlockListeners = () => {
      document.addEventListener('click', prepareSound, { once: false });
      document.addEventListener('touchstart', prepareSound, { once: false });
      document.addEventListener('keydown', prepareSound, { once: false });
    };

    attachUnlockListeners();

    return () => {
      document.removeEventListener('click', prepareSound);
      document.removeEventListener('touchstart', prepareSound);
      document.removeEventListener('keydown', prepareSound);
    };
  });

  return {
    notification,
    notify,
    clearNotification,
    prepareSound,
    requestNotificationPermission,
    soundEnabled,
  };
};

export default useNotification;
