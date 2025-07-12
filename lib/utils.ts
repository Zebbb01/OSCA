// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NextResponse } from 'next/server'; // Added for handleApiError

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Keep toSnakeCase if it's used elsewhere in your project.
export const toSnakeCase = (str: string) =>
    str
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // remove non-alphanumeric characters
        .replace(/\s+/g, ' ') // normalize spaces
        .trim()
        .replace(/\s/g, '_') // replace spaces with underscores

/**
 * Handles the common error response for API routes.
 */
export function handleApiError(error: any, message: string, status: number = 500) {
  console.error(`❌ API Error: ${message}`, error);
  return NextResponse.json({ success: false, message, error: error.message || String(error) }, { status });
}