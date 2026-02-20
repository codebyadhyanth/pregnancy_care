import React from 'react';
import styles from './postpartumCare.module.css';

const NotificationPreview = ({ notifications }) => {
    return (
        <div className={styles.notificationArea}>
            <div className={styles.notificationScroll}>
                {notifications.map((notif, index) => (
                    <div key={index} className={styles.pill}>
                        <span>{notif.icon}</span>
                        <span>{notif.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationPreview;
