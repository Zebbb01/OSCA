// src/types/seniors.d.ts

export type SeniorsFormDataType = {
  id?: string; // For update scenarios
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  age: string;
  birthDate: string;
  gender: 'male' | 'female';
  barangay: string;
  purok: string;
  contactNumber: string;
  emergencyNumber: string;
  contactPerson: string;
  contactRelationship: string;
  pwd: boolean;
  lowIncome: boolean;
  // Documents are handled separately, so they aren't part of this base type
  // medical_assistance?: File[]; // Example if you want to include files in the form data type
  // birth_certificate?: File;
  // etc.
};