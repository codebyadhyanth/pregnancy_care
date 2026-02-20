import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './postpartumCare.module.css';

const AlertCard = ({ title, items }) => {
    return (
        <div className={styles.alertCard}>
            <div className={styles.alertTitleRow}>
                <AlertTriangle size={24} />
                <h4>{title}</h4>
            </div>
            <div className={styles.alertContent}>
                <ul className={styles.list}>
                    {items.map((item, index) => (
                        <li key={index} className={styles.listItem}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AlertCard;
