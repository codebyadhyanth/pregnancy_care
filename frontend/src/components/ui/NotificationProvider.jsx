import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Notification from './Notification';
import { BABY_JOKES } from '../../config/notification.config';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const timeoutRef = useRef(null);

    const hideNotification = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setNotification(null);
    }, []);

    const showNotification = useCallback((customMessage) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const randomJoke =
            BABY_JOKES[Math.floor(Math.random() * BABY_JOKES.length)];

        setNotification({
            message: customMessage || randomJoke,
        });

        timeoutRef.current = setTimeout(() => {
            hideNotification();
        }, 5000);
    }, [hideNotification]);

    const value = {
        showNotification,
        hideNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <Notification
                isVisible={!!notification}
                message={notification?.message}
                onClose={hideNotification}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return ctx;
};

