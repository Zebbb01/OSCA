'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react'; // Assuming you have lucide-react for icons
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // For better table formatting
import { Seniors } from '@/types/seniors'; // Adjust path as needed
import { formatDateTime, formatDateOnly } from '@/utils/format'; // Adjust path as needed

interface DownloadReleasedSeniorsReportProps {
  data: Seniors[]; // The full data set from your table
}

export const DownloadReleasedSeniorsReport: React.FC<DownloadReleasedSeniorsReportProps> = ({ data }) => {
  const handleDownloadReport = () => {
    const releasedSeniors = data.filter(senior => senior.releasedAt);

    if (releasedSeniors.length === 0) {
      alert('No released senior citizen records to download.');
      return;
    }

    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: 'Released Senior Citizens Report',
      subject: 'Report of senior citizens who have been released',
      author: 'Senior Citizen Management System',
    });

    // Add a title
    doc.setFontSize(18);
    doc.text('Released Senior Citizens Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Date Generated: ${formatDateTime(new Date().toISOString())}`, 14, 26);

    // Prepare table headers and data
    const tableColumn = [
      'Full Name',
      'Contact No.',
      'Barangay',
      'Purok',
      'Gender',
      'PWD',
      'Category',
      'Age',
      'Emergency Contact',
      'Birthdate',
      'Remarks',
      'Released At',
    ];

    const tableRows = releasedSeniors.map(senior => {
      const fullName = [senior.firstname, senior.middlename, senior.lastname].filter(Boolean).join(' ');
      const categoryName = senior.Applications?.[0]?.category?.name || 'N/A';
      const releasedDate = senior.releasedAt ? formatDateTime(senior.releasedAt) : 'N/A';
      const pwdStatus = senior.pwd ? 'Yes' : 'No';

      return [
        fullName,
        senior.contact_no || 'N/A',
        senior.barangay || 'N/A',
        senior.purok || 'N/A',
        senior.gender || 'N/A',
        pwdStatus,
        categoryName,
        senior.age?.toString() || 'N/A',
        senior.emergency_no || 'N/A',
        formatDateOnly(senior.birthdate),
        senior.remarks?.name || 'N/A',
        releasedDate,
      ];
    });

    // Generate table using jspdf-autotable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35, // Start table below the title and date
      theme: 'grid', // Add borders to the table
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak', // Allow text to wrap
      },
      headStyles: {
        fillColor: [34, 139, 34], // A nice blue for the header
        textColor: 255, // White text
        fontStyle: 'bold',
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      didDrawPage: function (data) {
        // Footer - page number
        doc.setFontSize(8);
        const pageCount = doc.internal.pages.length;
        doc.text(`Page ${data.pageNumber} of ${pageCount - 1}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
      }
    });

    // Save the PDF
    doc.save('released_senior_citizens_report.pdf');
  };

  return (
    <Button onClick={handleDownloadReport} variant="outline" size="sm" className="h-8">
      <DownloadIcon className="mr-2 h-4 w-4" />
      Download Report
    </Button>
  );
};