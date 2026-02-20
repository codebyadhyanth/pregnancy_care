import React from 'react';
import { Heart, Activity, Coffee, Moon, User as UserIcon } from 'lucide-react';
import PostpartumCard from './PostpartumCard';
import AlertCard from './AlertCard';
import NotificationPreview from './NotificationPreview';
import styles from './postpartumCare.module.css';

// SVG Illustrations as Functional Components
const PhysicalIllustration = ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#FDF2F0" />
        <path d="M60 140C60 140 80 100 100 100C120 100 140 140 140 140" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <circle cx="100" cy="80" r="20" fill={color} />
        <path d="M80 150H120" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
);

const BreastfeedingIllustration = ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#F0F7FD" />
        <circle cx="100" cy="90" r="30" stroke={color} strokeWidth="6" />
        <path d="M70 130Q100 160 130 130" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <path d="M100 60V40" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
);

const EmotionalIllustration = ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#F5F0FD" />
        <path d="M60 100C60 77.9086 77.9086 60 100 60C122.091 60 140 77.9086 140 100C140 122.091 122.091 140 100 140" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <path d="M85 95H86M114 95H115" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <path d="M85 115C85 115 90 125 100 125C110 125 115 115 115 115" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
);

const SleepIllustration = ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#F0FDF4" />
        <path d="M140 100C140 122.091 122.091 140 100 140C77.9086 140 60 122.091 60 100C60 77.9086 77.9086 60 100 60" stroke={color} strokeWidth="4" />
        <path d="M100 60C100 60 110 80 100 100C90 120 100 140 100 140" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <path d="M75 90L85 90M115 90L125 90" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
);

const BodyChangesIllustration = ({ color, size }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#FEFCE8" />
        <path d="M100 60C80 60 60 80 60 100C60 140 100 160 100 160C100 160 140 140 140 100C140 80 120 60 100 60Z" fill={color} opacity="0.2" />
        <path d="M100 140C110 140 120 130 120 120C120 110 110 100 100 100C90 100 80 110 80 120C80 130 90 140 100 140Z" stroke={color} strokeWidth="4" />
        <path d="M100 100V80" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
);

const PostpartumCareGuide = () => {
    const cards = [
        {
            title: "Physical Recovery",
            illustration: PhysicalIllustration,
            content: [
                "Rest is essential – your body needs time to heal.",
                "Iron & calcium rich diet for strength.",
                "Stay hydrated – drink plenty of water.",
                "Gentle movement only after doctor approval.",
                "Proper wound care is critical for healing.",
                "C-section recovery typically takes 6–8 weeks."
            ],
            color: "#e5a892"
        },
        {
            title: "Breastfeeding Support",
            illustration: BreastfeedingIllustration,
            content: [
                "Latching may take time and patience.",
                "Soreness is common in the beginning.",
                "Feed frequently to establish milk supply.",
                "Proper positioning helps prevent discomfort.",
                "Consult a lactation expert for persistent issues."
            ],
            color: "#92b5e5"
        },
        {
            title: "Emotional Health",
            illustration: EmotionalIllustration,
            content: [
                "Baby Blues: Mood swings, crying, and overwhelm (usually 1–2 weeks).",
                "Postpartum Depression: Persistent sadness, disconnection, guilt, loss of interest.",
                "If symptoms last more than 2 weeks, consult a professional.",
                "This is not weakness. Your body and mind need care too."
            ],
            color: "#b592e5"
        },
        {
            title: "Sleep & Energy",
            illustration: SleepIllustration,
            content: [
                "Newborns usually wake every 2–3 hours.",
                "Sleep when the baby sleeps whenever possible.",
                "Accept help from family and friends.",
                "Share responsibilities with your partner.",
                "Limit visitors during the first few weeks."
            ],
            color: "#92e5a8"
        },
        {
            title: "Body Changes",
            illustration: BodyChangesIllustration,
            content: [
                "Back and pelvic pain are common post-delivery.",
                "Hair fall and weakness are normal transitions.",
                "Stretch marks are signs of your incredible journey.",
                "Recovery takes time. Be kind to yourself."
            ],
            color: "#e5d292"
        }
    ];

    const alertItems = [
        "Fever",
        "Heavy bleeding",
        "Severe pain",
        "Persistent sadness or anxiety"
    ];

    const notifications = [
        { icon: "💖", text: "Mom check! How are YOU feeling today?" },
        { icon: "💧", text: "Hydration reminder: Baby says drink water!" },
        { icon: "💤", text: "Rest time, Supermom!" }
    ];

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Postpartum Care Guide</h2>
            <div className={styles.grid}>
                {cards.slice(0, 4).map((card, index) => (
                    <PostpartumCard
                        key={index}
                        title={card.title}
                        illustration={card.illustration}
                        content={card.content}
                        iconColor={card.color}
                    />
                ))}
            </div>
            <div className="mt-8">
                <PostpartumCard
                    title={cards[4].title}
                    illustration={cards[4].illustration}
                    content={cards[4].content}
                    iconColor={cards[4].color}
                />
            </div>

            <AlertCard title="When To See a Doctor" items={alertItems} />

            <NotificationPreview notifications={notifications} />

            <div className="mt-8 text-center text-xs text-gray-400">
                “I am healing. I am supported. I am not alone.”
            </div>
        </div>
    );
};

export default PostpartumCareGuide;
