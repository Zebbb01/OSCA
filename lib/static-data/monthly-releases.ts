// lib/static-data/monthly-releases.ts

export type MonthlyRelease = {
    id: string;
    month: string; // e.g., "July 2025"
    releaseDate: string; // YYYY-MM-DD
    totalAmountReleased: number;
    numberOfBeneficiaries: number;
    status: 'Released' | 'Scheduled' | 'Delayed';
    details: Array<{
        beneficiaryName: string;
        amount: number;
        status: 'Claimed' | 'Unclaimed';
    }>;
};

export const staticMonthlyReleases: MonthlyRelease[] = [
    {
        id: 'mr_2025_06',
        month: 'June 2025',
        releaseDate: '2025-06-25',
        totalAmountReleased: 150000.00,
        numberOfBeneficiaries: 150,
        status: 'Released',
        details: [
            { beneficiaryName: 'Juan Dela Cruz', amount: 1000.00, status: 'Claimed' },
            { beneficiaryName: 'Maria Santos', amount: 1000.00, status: 'Claimed' },
            { beneficiaryName: 'Pedro Reyes', amount: 1000.00, status: 'Unclaimed' },
            { beneficiaryName: 'Ana Lim', amount: 1000.00, status: 'Claimed' },
            // ... more beneficiaries
        ],
    },
    {
        id: 'mr_2025_07',
        month: 'July 2025',
        releaseDate: '2025-07-20',
        totalAmountReleased: 160000.00,
        numberOfBeneficiaries: 160,
        status: 'Scheduled',
        details: [
            { beneficiaryName: 'Alice Johnson', amount: 1000.00, status: 'Unclaimed' },
            { beneficiaryName: 'Bob Williams', amount: 1000.00, status: 'Unclaimed' },
        ],
    },
    {
        id: 'mr_2025_05',
        month: 'May 2025',
        releaseDate: '2025-05-28',
        totalAmountReleased: 145000.00,
        numberOfBeneficiaries: 145,
        status: 'Released',
        details: [
            { beneficiaryName: 'Carlos Garcia', amount: 1000.00, status: 'Claimed' },
            { beneficiaryName: 'Sofia Mendoza', amount: 1000.00, status: 'Claimed' },
        ],
    },
    {
        id: 'mr_2025_04',
        month: 'April 2025',
        releaseDate: '2025-04-30',
        totalAmountReleased: 140000.00,
        numberOfBeneficiaries: 140,
        status: 'Released',
        details: [
            { beneficiaryName: 'David Lee', amount: 1000.00, status: 'Claimed' },
            { beneficiaryName: 'Emily Chen', amount: 1000.00, status: 'Claimed' },
        ],
    },
];

// Helper functions (optional, but good for calculations)
export const calculateTotalReleasedOverall = (releases: MonthlyRelease[]): number => {
    return releases.reduce((sum, release) => sum + release.totalAmountReleased, 0);
};

export const calculateTotalBeneficiariesOverall = (releases: MonthlyRelease[]): number => {
    return releases.reduce((sum, release) => sum + release.numberOfBeneficiaries, 0);
};

export const calculateTotalClaimed = (release: MonthlyRelease): number => {
    return release.details.filter(d => d.status === 'Claimed').reduce((sum, d) => sum + d.amount, 0);
};

export const calculateTotalUnclaimed = (release: MonthlyRelease): number => {
    return release.details.filter(d => d.status === 'Unclaimed').reduce((sum, d) => sum + d.amount, 0);
};