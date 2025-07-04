// types/application.ts
import { RegistrationDocument } from "./seniors" // Ensure this path is correct

export type BenefitApplicationData = {
    id: number
    benefit_id: number
    senior_id: number
    status_id: number
    category_id: number | null
    createdAt: string // ISO date string
    updatedAt: string // ISO date string
    scheduledDate: string | null; // NEW: ISO date string for the scheduled date
    benefit: {
        name: string
        // You might want to include benefit_requirements here as well if you plan to use it for display
        // benefit_requirements?: { name: string; id: number }[]
    }
    senior: {
        firstname: string
        middlename: string | null // Changed to allow null based on Prisma schema
        lastname: string
        email: string | null // Changed to allow null based on Prisma schema
        pwd: boolean // Added this field to check PWD status
        documents: RegistrationDocument[] // This is the crucial addition!
    }
    status: {
        name: string
    }
    category: {
        name: string
    } | null
}

// NEW: Type for the data sent when updating an application by admin
export type ApplicationUpdateData = {
    id: number;
    scheduledDate?: string | null; // Optional, ISO date string for the new scheduled date
    status_id?: number; // Optional, for changing application status
    category_id?: number; // Optional, for changing application category
    // Add any other fields here that an admin is allowed to update
}

export type UpdateCategoryData = {
    application_id: number,
    category_id: number
}

export type UpdateStatusData = {
    application_id: number,
    status_id: number
}