// types\seniors.ts
import { QueryClient } from "@tanstack/react-query";

export const enum RegistrationDocumentTag {
    BIRTH_CERTIFICATE = 'birth_certificate',
    CERTIFICATE_OF_RESIDENCY = 'certificate_of_residency',
    GOVERNMENT_ISSUED_ID = 'government_issued_id',
    MEMBERSHIP_CERTIFICATE = 'membership_certificate',
    MEDICAL_ASSISTANCE = 'medical_assistance',
    ID_PHOTO = 'id_photo'
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
    contactNumber: string | null;
    emergencyNumber: string | null;
    contactPerson: string | null;
    contactRelationship: string | null;
    pwd: boolean;
    lowIncome: boolean;
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

export interface BenefitRequirementWithBenefit {
  id: number;
  name: string;
  benefit?: {
    id: number;
    name: string;
  };
}
export interface RegistrationDocument {
  id: number;
  tag: string;
  path: string;
  public_id?: string;
  imageUrl?: string;
  file_name: string;
  seniors_id: number;
  createdAt: string;
  updatedAt: string;
  benefit_requirement_id?: number;
  benefitRequirement?: BenefitRequirementWithBenefit; // Add this relationship
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
// Make sure this matches your Prisma Senior model closely
export interface Seniors {
    id: number;
    firstname: string;
    middlename: string | null;
    lastname: string;
    email: string | null;
    contact_no: string | null;
    emergency_no: string | null;
    contact_person: string | null; // Changed to allow null based on schema
    contact_relationship: string | null; // Changed to allow null based on schema
    birthdate: Date;
    age: string; // Keep as string here if your Prisma schema defines it as String
    gender: 'male' | 'female';
    barangay: string;
    purok: string;
    pwd: boolean;
    low_income: boolean;
    remarks_id: number;
    remarks: Remarks;
    Applications: Array<{
        id: string;
        category: { name: string } | null;
        status: { name: string };
        benefit: { name: string; description: string; tag: string };
        createdAt: Date;
    }>;
    documents?: RegistrationDocument[];
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    releasedAt?: Date | null;
}

export type Categories = {
    id: number;
    name: string;
}

export type Status = {
    id: number;
    name: string;
}

// Edit Dialog

// Reusable editable form field component
export interface EditableFormFieldProps {
    label: string;
    id: string;
    value: string | null | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    readOnly?: boolean;
}
// --- UPDATED EditableDateField COMPONENT ---
export interface EditableDateFieldProps {
    label: string;
    id: string;
    value: Date | null | undefined; // Keep as Date | null | undefined for internal state
    onChange: (date: Date | null) => void; // react-datepicker passes Date | null
    placeholder?: string;
    readOnly?: boolean;
}

// Reusable checkbox field component (for editing)
export interface EditableCheckboxFieldProps {
    label: string;
    id: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

// Section Header (reused from SeniorViewDialog)
export interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export interface SeniorUpdateData {
    id: number;
    firstname: string; // Required by Prisma
    middlename: string | null; // Optional in Prisma
    lastname: string; // Required by Prisma
    age: string; // Required by Prisma (as string)
    birthdate: string; // Required by Prisma (as DateTime), will be ISO string
    gender: 'male' | 'female'; // Required by Prisma (as Gender enum)
    email: string | null; // Optional in Prisma
    contact_no: string; // Required by Prisma
    emergency_no: string; // Required by Prisma
    barangay: string; // Required by Prisma
    purok: string; // Required by Prisma
    pwd: boolean; // Required by Prisma (default false, but editable)
    low_income: boolean;
    contact_person: string | null; // Optional in Prisma
    contact_relationship: string | null; // Optional in Prisma
    releasedAt?: string | null;
    remarks_id?: number;
}


// Main Senior Edit Dialog Component
export interface SeniorEditDialogProps {
    senior: Seniors;
    userRole: string | undefined;
    queryClient: QueryClient;
    trigger?: React.ReactNode;
}

// Define the state type to match the form fields.
// These should closely reflect the Senior type's editable fields
// with appropriate types for the React state (e.g., Date for birthdate).
export interface EditFormState {
    firstname: string;
    middlename: string | null;
    lastname: string;
    age: number; // Stored as number in React state for numeric input
    birthdate: Date | null; // Changed to Date | null to match react-datepicker
    gender: 'male' | 'female' | ''; // Allow empty string for initial state or if unselected
    email: string | null;
    contact_no: string;
    emergency_no: string;
    barangay: string;
    purok: string;
    pwd: boolean;
    low_income: boolean;
    contact_person: string | null;
    contact_relationship: string | null;
    releasedAt: Date | null;
    remarks_id?: number;
}

export interface EditableSelectFieldProps { // Add this new interface
    label: string;
    id: string;
    value: string | null | undefined;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}