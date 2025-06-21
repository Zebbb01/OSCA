export const enum RegistrationDocumentTag {
    BIRTH_CERTIFICATE = 'birth_certificate',
    CERTIFICATE_OF_RESIDENCY = 'certificate_of_residency',
    GOVERNMENT_ISSUED_ID = 'government_issued_id',
    MEMBERSHIP_CERTIFICATE = 'membership_certificate',
    MEDICAL_ASSISTANCE = 'medical_assistance',
}

export interface SeniorsFormDataType {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    age: string;
    birthDate: string;
    gender: string;
    barangay: string;
    purok: string;
    contactNumber: string;
    emergencyNumber: string;
    contactPerson: string;
    pwd: boolean;
    birth_certificate?: File | null;
    certificate_of_residency?: File | null;
    government_issued_id?: File | null;
    membership_certificate?: File | null;
    medical_assistance?: File[] | FileList | null;
}

export interface RegistrationDocumentType {
    birth_certificate?: File | null;
    certificate_of_residency?: File | null;
    government_issued_id?: File | null;
    membership_certificate?: File | null;
    medical_assistance?: File[] | FileList | null;
}

export interface RegistrationDocument {
    id: number;
    tag: string;
    path: string;
    public_id?: string;
    imageUrl?: string; // Made optional as per schema
    file_name: string;
    seniors_id: number;
    createdAt: Date; // Should be Date here if you parse it on client, or string if left raw
    updatedAt: Date; // Should be Date here if you parse it on client, or string if left raw
}

export interface SeniorsDocuments {
    id: number;
    firstname: string;
    middlename?: string;
    lastname: string;
    email?: string;
    documents: RegistrationDocument[];
}

export type Remarks = {
    id: number;
    name: string;
}

// --- CORE SENIORS INTERFACE ---
// This should match the Senior model in Prisma, potentially with included relations
// as they appear when fetched for the general table, not specifically for the report.
export interface Seniors {
    id: number;
    firstname: string;
    middlename: string | null; // Use null for nullable fields as per Prisma
    lastname: string;
    email: string | null; // Use null for nullable fields as per Prisma
    contact_no: string;
    emergency_no: string;
    contact_person: string;
    birthdate: Date; // Assuming you parse it to Date after fetching from string
    age: string;
    gender: 'male' | 'female'; // Matches Prisma enum
    barangay: string;
    purok: string;
    pwd: boolean;
    remarks_id: number;
    remarks: Remarks; // According to your schema, remarks is always related
    Applications: Array<{ // This is what the general 'Seniors' fetch might include
        category: { name: string } | null;
        status: { name: string }; // Status is not optional in schema
        benefit: { name: string; description: string; tag: string }; // Add benefit to Seniors.Applications if you fetch it
        createdAt: Date; // Assuming parsed to Date
    }>;
    documents?: RegistrationDocument[];
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    releasedAt: Date | null; // Matches schema
}

export type Categories = {
    id: number;
    name: string;
}

export type Status = {
    id: number;
    name: string;
}
