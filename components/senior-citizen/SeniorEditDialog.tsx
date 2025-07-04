// src/components/senior-citizen/SeniorEditDialog.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, UserIcon, PhoneIcon, StickyNoteIcon } from 'lucide-react';
import { EditableCheckboxFieldProps, EditableDateFieldProps, EditableFormFieldProps, EditableSelectFieldProps, EditFormState, SectionHeaderProps, SeniorEditDialogProps, Seniors, SeniorUpdateData } from '@/types/seniors'; // Ensure this path is correct
import { useSeniorMutations } from '@/hooks/mutations/use-senior-mutations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import { SELECT_OPTIONS } from '@/constants/select-options'; 

const EditableFormField: React.FC<EditableFormFieldProps> = ({
  label,
  id,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  readOnly = false,
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}
    />
  </div>
);

const EditableSelectField: React.FC<EditableSelectFieldProps> = ({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const EditableDateField: React.FC<EditableDateFieldProps> = ({
  label,
  id,
  value,
  onChange,
  placeholder = 'MM/DD/YYYY',
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <DatePicker
      selected={value}
      onChange={onChange}
      dateFormat={[
        'MM/dd/yyyy',
        'yyyy-MM-dd',
        'MMMM d, yyyy',
        'MMM d, yyyy',
        'MMMM dd, yyyy',
        'MMMM d, yyyy',
      ]}
      placeholderText={placeholder}
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
);

const EditableCheckboxField: React.FC<EditableCheckboxFieldProps> = ({ label, id, checked, onCheckedChange }) => (
  <div className="flex flex-col space-y-1">
    <Label htmlFor={id}>{label}</Label>
    <div className="flex items-center space-x-2 pt-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  </div>
);

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, description }) => (
  <div className="pb-4 p-6">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export const SeniorEditDialog: React.FC<SeniorEditDialogProps> = ({
  senior,
  queryClient,
  trigger
}) => {
  const [open, setOpen] = React.useState(false);

  const [editData, setEditData] = React.useState<EditFormState>({
    firstname: senior.firstname,
    middlename: senior.middlename,
    lastname: senior.lastname,
    age: parseInt(senior.age, 10) || 0, // Convert age from string to number for state
    birthdate: senior.birthdate ? new Date(senior.birthdate) : null, // Initialize with Date object or null
    gender: senior.gender || '', // Initialize with senior.gender or empty string
    email: senior.email,
    contact_no: senior.contact_no,
    emergency_no: senior.emergency_no,
    barangay: senior.barangay,
    purok: senior.purok,
    pwd: senior.pwd,
    contact_person: senior.contact_person,
  });

  const { updateSeniorMutation } = useSeniorMutations(queryClient);

  React.useEffect(() => {
    // Reset editData if the senior prop changes (e.g., when a different senior is selected for edit)
    setEditData({
      firstname: senior.firstname,
      middlename: senior.middlename,
      lastname: senior.lastname,
      age: parseInt(senior.age, 10) || 0,
      birthdate: senior.birthdate ? new Date(senior.birthdate) : null, // Initialize with Date object or null
      gender: senior.gender || '',
      email: senior.email,
      contact_no: senior.contact_no,
      emergency_no: senior.emergency_no,
      barangay: senior.barangay,
      purok: senior.purok,
      pwd: senior.pwd,
      contact_person: senior.contact_person,
    });
  }, [senior]);


  const handleUpdate = () => {
    const finalGender: 'male' | 'female' = editData.gender === 'male' || editData.gender === 'female'
      ? editData.gender
      : 'male'; // Or 'female', or handle error if neither is selected

    const payload: SeniorUpdateData = {
      id: senior.id,
      firstname: editData.firstname || '', // Ensure string
      middlename: editData.middlename,
      lastname: editData.lastname || '', // Ensure string
      age: editData.age.toString(), // Convert number back to string for Prisma
      birthdate: editData.birthdate ? editData.birthdate.toISOString() : new Date().toISOString(),
      gender: finalGender,
      email: editData.email,
      contact_no: editData.contact_no || '', // Ensure string
      emergency_no: editData.emergency_no || '', // Ensure string
      barangay: editData.barangay || '', // Ensure string
      purok: editData.purok || '', // Ensure string
      pwd: editData.pwd,
      contact_person: editData.contact_person,
    };

    updateSeniorMutation.mutate(payload, {
      onSuccess: () => {
        setOpen(false); // Close dialog on success
      }
    });
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md bg-background cursor-pointer text-sm ring-offset-background hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <Pencil className="h-5 w-5 text-blue-600" />
    </Button>
  );

  const genderOptions = [
    { value: 'male', label: 'Male' }, // Changed to lowercase to match Prisma enum
    { value: 'female', label: 'Female' }, // Changed to lowercase to match Prisma enum
    // { value: 'Other', label: 'Other' }, // Removed 'Other' if Prisma only supports 'male'|'female'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Senior Profile</DialogTitle>
          <DialogDescription>
            Update full details for {senior.firstname} {senior.lastname}.
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
                <EditableFormField
                  label="First Name *"
                  id="firstname"
                  value={editData.firstname}
                  onChange={(value) => setEditData({ ...editData, firstname: value })}
                />
                <EditableFormField
                  label="Middle Name"
                  id="middlename"
                  value={editData.middlename}
                  onChange={(value) => setEditData({ ...editData, middlename: value })}
                />
                <EditableFormField
                  label="Last Name *"
                  id="lastname"
                  value={editData.lastname}
                  onChange={(value) => setEditData({ ...editData, lastname: value })}
                />
              </div>

              {/* Age, Birth Date, Gender Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EditableFormField
                  label="Age"
                  id="age"
                  value={editData.age?.toString()} // Convert number back to string for input value
                  onChange={(value) => setEditData({ ...editData, age: parseInt(value, 10) || 0 })}
                  type="number"
                />
                {/* --- Birth Date Field Using react-datepicker --- */}
                <EditableDateField
                  label="Birth Date"
                  id="birthdate"
                  value={editData.birthdate}
                  onChange={(date) => setEditData({ ...editData, birthdate: date })}
                />
                {/* --- End Birth Date Field --- */}
                <EditableSelectField
                  label="Gender"
                  id="gender"
                  value={editData.gender}
                  onChange={(value) => {
                    // Only allow 'male' or 'female' for direct assignment
                    const newGender = (value === 'male' || value === 'female') ? value : '';
                    setEditData({ ...editData, gender: newGender });
                  }}
                  options={genderOptions}
                />
              </div>

              {/* PWD Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EditableCheckboxField
                  label="Are you a PWD?"
                  id="pwd"
                  checked={editData.pwd}
                  onCheckedChange={(checked) => setEditData({ ...editData, pwd: !!checked })}
                />
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
                <EditableFormField
                  label="Contact Number"
                  id="contact_no"
                  value={editData.contact_no}
                  onChange={(value) => setEditData({ ...editData, contact_no: value })}
                  type="tel"
                />
                <EditableFormField
                  label="Emergency Contact"
                  id="emergency_no"
                  value={editData.emergency_no}
                  onChange={(value) => setEditData({ ...editData, emergency_no: value })}
                  type="tel"
                />
              </div>

              {/* Address Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Modified Barangay field to use EditableSelectField */}
                <EditableSelectField
                  label="Barangay"
                  id="barangay"
                  value={editData.barangay}
                  onChange={(value) => setEditData({ ...editData, barangay: value })}
                  options={SELECT_OPTIONS.barangay} // Use SELECT_OPTIONS.barangay here
                  placeholder="Select barangay"
                />
                <EditableFormField
                  label="Lot / Block / Street / Purok"
                  id="purok"
                  value={editData.purok}
                  onChange={(value) => setEditData({ ...editData, purok: value })}
                />
              </div>

              {/* Email and Contact Person Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <EditableFormField
                  label="Email Address"
                  id="email"
                  value={editData.email}
                  onChange={(value) => setEditData({ ...editData, email: value })}
                  type="email"
                /> */}
                <EditableFormField
                  label="Contact Person"
                  id="contact_person"
                  value={editData.contact_person}
                  onChange={(value) => setEditData({ ...editData, contact_person: value })}
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section (Read-only for Remarks/Release Date) */}
          {(senior.remarks?.name || senior.releasedAt) && (
            <div className="border rounded-lg">
              <SectionHeader
                icon={<StickyNoteIcon className="h-5 w-5 text-green-600" />}
                title="Additional Information (Read-Only)"
                description="Additional notes and status information cannot be edited here."
              />
              <div className="px-6 pb-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {senior.remarks?.name && (
                    <EditableFormField
                      label="Remarks"
                      id="remarks"
                      value={senior.remarks.name}
                      onChange={() => {}} // Read-only, no change handler
                      readOnly
                    />
                  )}
                  {senior.releasedAt && (
                    <EditableFormField
                      label="Released On"
                      id="releasedAt"
                      value={senior.releasedAt ? new Date(senior.releasedAt).toLocaleString() : ''} // Ensure null handling
                      onChange={() => {}} // Read-only, no change handler
                      readOnly
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={updateSeniorMutation.isPending}
          >
            {updateSeniorMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};