// utils\format.ts
export function formatDocumentTagName(str: string): string {
  return str
    .split('_') // Split by underscores
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1) // Capitalize each word
    )
    .join(' ') // Join with spaces
}

export function formatDateOnly(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  const options: Intl.DateTimeFormatOptions = {
    month: 'short', // Changed from '2-digit' to '3-digit'
    day: 'numeric', // Changed from '2-digit' to 'numeric' for single-digit days without leading zero
    year: 'numeric',
  }

  return date.toLocaleDateString('en-US', options)
}

export function formatDateTime(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }

  return date.toLocaleString('en-US', options)
}

export const getDownloadUrl = (imageUrl: string, filename: string) => {
  // Check if it's a Cloudinary URL
  if (imageUrl.includes('cloudinary.com')) {
    try {
      // Parse the Cloudinary URL
      const urlParts = imageUrl.split('/upload/');

      if (urlParts.length !== 2) {
        console.error('Invalid Cloudinary URL format');
        return imageUrl;
      }

      const baseUrl = urlParts[0];
      const resourcePath = urlParts[1];

      // For Cloudinary, use fl_attachment with the proper syntax
      // Note: No colon after fl_attachment
      return `${baseUrl}/upload/fl_attachment/${resourcePath}`;

    } catch (error) {
      console.error('Error creating download URL:', error);
      return imageUrl;
    }
  }
}