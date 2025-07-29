// --- NEW Notification Type ---
export interface Notification {
    id: string;
    type: 'senior_pending' | 'release_approved'; // Define specific types
    message: string;
    timestamp: string; // ISO string
    link: string;
    seniorId?: number; // Optional: Link to a senior's ID
    seniorName?: string; // Optional: For display purposes
}