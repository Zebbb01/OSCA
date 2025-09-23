// utils/pdf-header-footer.ts
import jsPDF from 'jspdf';

interface HeaderFooterOptions {
  doc: jsPDF;
  pageNumber: number;
  totalPages: number;
  title: string;
  subtitle?: string;
}

export const addPdfHeaderAndFooter = async (options: HeaderFooterOptions) => {
  const { doc, pageNumber, totalPages, title, subtitle } = options;
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  try {
    // Load images as base64
    const bgImage = await loadImageAsBase64('/img/cthall-bg.png');
    const logoImageRaw = await loadImageAsBase64('/img/cthall-logo.jpg');
    
    // Create circular version of the logo
    const logoImage = await createCircularLogo(logoImageRaw);
    
    // Header section
    const headerHeight = 25;
    
    // Add background image for header
    doc.addImage(bgImage, 'PNG', 0, 0, pageWidth, headerHeight);
    
    // Add circular logo to header (positioned on the left)
    const logoSize = 20;
    const logoX = 15;
    const logoY = 2.5;
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoSize, logoSize);
    
    // Add title text (positioned next to logo)
    doc.setTextColor(255, 255, 255); // White text for contrast
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, logoX + logoSize + 10, 12);
    
    // Add subtitle if provided
    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, logoX + logoSize + 10, 18);
    }
    
    // Footer section
    const footerHeight = 15;
    const footerY = pageHeight - footerHeight;
    
    // Add background image for footer
    doc.addImage(bgImage, 'PNG', 0, footerY, pageWidth, footerHeight);
    
    // Add footer text
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Left side - Organization info
    doc.text('Office of Senior Citizens Affairs (OSCA)', 10, footerY + 8);
    doc.text('City of Panabo, Davao Del Norte', 10, footerY + 12);
    
    // Right side - Page number
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 40, footerY + 10, { align: 'right' });
    
    // Reset text color to black for document content
    doc.setTextColor(0, 0, 0);
    
  } catch (error) {
    console.warn('Failed to load header/footer images, using text-only fallback:', error);

    // Define header/footer dimensions for fallback
    const headerHeight = 25;
    const footerHeight = 15;
    const footerY = pageHeight - footerHeight;
    
    // Fallback header without images
    doc.setFillColor(34, 139, 34); // Green background
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Add circular logo placeholder
    const logoSize = 18;
    const logoX = 15;
    const logoY = 3.5;
    
    // Create white circle for logo
    doc.setFillColor(255, 255, 255);
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
    
    // Add green border to circle
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.8);
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'S');
    
    // Add "OSCA" text inside circle
    doc.setTextColor(34, 139, 34);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('OSCA', logoX + logoSize/2, logoY + logoSize/2 + 2, { align: 'center' });
    
    // Add title text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, logoX + logoSize + 10, 12);
    
    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, logoX + logoSize + 10, 18);
    }
    
    // Fallback footer without images
    doc.setFillColor(34, 139, 34);
    doc.rect(0, footerY, pageWidth, footerHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Office of Senior Citizens Affairs (OSCA)', 10, footerY + 8);
    doc.text('City of Panabo, Davao Del Norte', 10, footerY + 12);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 40, footerY + 10, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
  }
};

// Helper function to load image as base64
const loadImageAsBase64 = (imagePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imagePath}`));
    };
    
    img.src = imagePath;
  });
};

// Helper function to create circular version of logo
const createCircularLogo = (logoBase64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context for circular logo'));
        return;
      }
      
      // Set canvas size to be square (use the smaller dimension)
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      
      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
      ctx.clip();
      
      // Calculate positioning to center the logo
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      
      // Draw the logo centered and clipped to circle
      ctx.drawImage(img, -offsetX, -offsetY, img.width, img.height);
      
      try {
        const circularDataURL = canvas.toDataURL('image/png');
        resolve(circularDataURL);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to process logo for circular cropping'));
    img.src = logoBase64;
  });
};

// Calculate content area boundaries (accounting for header/footer)
export const getContentBoundaries = () => {
  return {
    topMargin: 30, // Space below header
    bottomMargin: 20, // Space above footer
    leftMargin: 14,
    rightMargin: 14
  };
};