// components\senior-citizen\SeniorViewDialog.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EyeIcon, UserIcon, PhoneIcon, StickyNoteIcon } from 'lucide-react';
import { formatDateOnly, formatDateTime } from '@/utils/format';
import { Seniors } from '@/types/seniors';

// Separate component for form-like field display
interface FormFieldViewProps {
  label: string;
  value: string | null | undefined;
  placeholder?: string;
}

const FormFieldView: React.FC<FormFieldViewProps> = ({ label, value, placeholder = 'N/A' }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
      {value || placeholder}
    </div>
  </div>
);

// Separate component for checkbox field display
interface CheckboxFieldViewProps {
  label: string;
  checked: boolean;
}

const CheckboxFieldView: React.FC<CheckboxFieldViewProps> = ({ label, checked }) => (
  <div>
    <div className="flex items-center space-x-2 pt-2">
      <div className={`w-4 h-4 rounded border ${checked ? 'bg-primary border-primary' : 'border-input'}`}>
        {checked && <div className="w-full h-full flex items-center justify-center text-white text-xs">✓</div>}
      </div>
      {/* Moved the label span inside the flex container */}
      <span className="text-sm">{label}</span> 
    </div>
  </div>
);

// Separate component for section headers
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, description }) => (
  <div className="pb-4 p-6">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

// Main Senior View Dialog Component
interface SeniorViewDialogProps {
  senior: Seniors;
  trigger?: React.ReactNode;
}

export const SeniorViewDialog: React.FC<SeniorViewDialogProps> = ({ 
  senior, 
  trigger 
}) => {
  const [open, setOpen] = React.useState(false);

  const defaultTrigger = (
    <Button 
      variant="ghost" 
      size="icon"
      className="h-10 w-10 rounded-md bg-background cursor-pointer text-sm ring-offset-background hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <EyeIcon className="h-5 w-5 text-green-600" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Senior Profile</DialogTitle>
          {/* Display Registered On date here */}
          <p className="text-gray-500 text-sm mt-1">
            Registered On: <span className="font-medium">{formatDateTime(senior.createdAt)}</span>
          </p>
          <DialogDescription>
            Full details of {senior.firstname} {senior.lastname}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8 p-1">
          {/* Personal Information Section */}
          <div className="border rounded-lg">
            <SectionHeader
              icon={<UserIcon className="h-5 w-5 text-green-600" />}
              title="Personal Information"
              description="Basic personal details and contact information"
            />
            <div className="px-6 pb-6 space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormFieldView label="First Name *" value={senior.firstname} />
                <FormFieldView label="Middle Name" value={senior.middlename} />
                <FormFieldView label="Last Name *" value={senior.lastname} />
              </div>

              {/* Age, Birth Date, Gender Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormFieldView label="Age" value={senior.age?.toString()} />
                <FormFieldView label="Birth Date" value={formatDateOnly(senior.birthdate)} />
                <FormFieldView label="Gender" value={senior.gender} />
              </div>

              {/* PWD Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CheckboxFieldView label="Are you a PWD?" checked={senior.pwd} />
                <CheckboxFieldView label="Are you a Low Income?" checked={senior.low_income} />
              </div>
            </div>
          </div>

          {/* Contact & Address Section */}
          <div className="border rounded-lg">
            <SectionHeader
              icon={<PhoneIcon className="h-5 w-5 text-green-600" />}
              title="Contact & Address"
              description="Phone numbers and address information"
            />
            <div className="px-6 pb-6 space-y-6">
              {/* Phone Numbers Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldView label="Contact Number" value={senior.contact_no} />
                <FormFieldView label="Emergency Contact" value={senior.emergency_no} />
              </div>
              {/* Contact Relationship Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldView label="Contact Person" value={senior.contact_person} />
                <FormFieldView label="Contact Relationship" value={senior.contact_relationship} />
              </div>

              {/* Address Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldView label="Barangay" value={senior.barangay} />
                <FormFieldView label="Lot / Block / Street / Purok" value={senior.purok} />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          {(senior.remarks?.name || senior.releasedAt) && (
            <div className="border rounded-lg">
              <SectionHeader
                icon={<StickyNoteIcon className="h-5 w-5 text-green-600" />}
                title="Additional Information"
                description="Additional notes and status information"
              />
              <div className="px-6 pb-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {senior.remarks?.name && (
                    <FormFieldView label="Remarks" value={senior.remarks.name} />
                  )}
                  {senior.releasedAt && (
                    <FormFieldView 
                      label="Released On" 
                      value={formatDateOnly(senior.releasedAt)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};