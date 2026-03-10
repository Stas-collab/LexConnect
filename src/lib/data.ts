import { Scale, Users, Gavel, Landmark, Briefcase, Home, Handshake, FileText, Video, MessageSquare, Search, type LucideIcon } from 'lucide-react';

export type LegalSpecialty = {
    name: string;
    icon: LucideIcon;
};

export const legalSpecialties: LegalSpecialty[] = [
    { name: 'Civil Law', icon: Scale },
    { name: 'Family Law', icon: Users },
    { name: 'Criminal Law', icon: Gavel },
    { name: 'Tax Law', icon: Landmark },
    { name: 'Corporate Law', icon: Briefcase },
    { name: 'Real Estate', icon: Home },
    { name: 'Labor Disputes', icon: Handshake },
    { name: 'Other', icon: FileText },
];

export const consultationTypes = [
    { name: 'Video Call', icon: Video },
    { name: 'Audio Call', icon: Users },
    { name: 'Text Chat', icon: MessageSquare },
    { name: 'Document Analysis', icon: FileText },
];

export const howItWorksSteps = [
    {
        step: 1,
        title: 'Find Your Lawyer',
        description: 'Use our filters to search for a lawyer by specialty, rating, experience, and price.',
        icon: Search,
    },
    {
        step: 2,
        title: 'Book a Consultation',
        description: 'Choose a convenient time and consultation type—video, audio, chat, or document review.',
        icon: Briefcase,
    },
    {
        step: 3,
        title: 'Get Expert Advice',
        description: 'Connect with your lawyer securely and get the professional legal help you need.',
        icon: Handshake,
    },
];

// Note: Lawyer data is now fetched from Firestore. This file can be removed or kept for other static data.
export type Lawyer = {
    id: string;
    name: string;
    avatar: string;
    specialty: string;
    experience: number;
    verified: boolean;
};

export const lawyers: Lawyer[] = []; // This is now empty as data comes from Firestore
