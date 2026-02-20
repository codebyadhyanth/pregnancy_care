import React from 'react';
import styles from './postpartumCare.module.css';

const PostpartumCard = ({ title, content, illustration: Illustration, iconColor = "#e5a892" }) => {
    return (
        <div className={styles.card}>
            <div className={styles.illustration}>
                <Illustration color={iconColor} size={100} />
            </div>
            <h4 className={styles.cardTitle}>{title}</h4>
            <div className={styles.divider}></div>
            <div className={styles.content}>
                <ul className={styles.list}>
                    {content.map((item, index) => (
                        <li key={index} className={styles.listItem}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PostpartumCard;
