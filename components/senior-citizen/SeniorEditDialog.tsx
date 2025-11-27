// components\senior-citizen\SeniorEditDialog.tsx
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
import { Pencil, UserIcon, PhoneIcon, StickyNoteIcon } from 'lucide-react';
import {
  EditableDateFieldProps,
  EditableFormFieldProps,
  EditableSelectFieldProps,
  EditFormState,
  SectionHeaderProps,
  SeniorEditDialogProps,
  SeniorUpdateData,
} from '@/types/seniors';
import { useSeniorMutations } from '@/hooks/mutations/use-senior-mutations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SELECT_OPTIONS } from '@/constants/select-options';
import { formatDateTime } from '@/utils/format';
import { useRemarksOptions } from '@/hooks/queries/use-remarks';
import { determineCategoryByAge } from '@/lib/utils/category-helper';

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
      onKeyDown={type === "number" || type === "tel" ? allowOnlyNumbers : undefined}
      inputMode={type === "number" || type === "tel" ? "numeric" : undefined}
      className={readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}
    />
  </div>
);

const allowOnlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
  ];

  if (allowedKeys.includes(e.key)) return;

  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

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
        {options.map((option) => (
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
  placeholder = 'Month Day, YYYY',
  readOnly = false,
}) => (
  <div className="flex flex-col">
    <Label htmlFor={id}>
      {label}
    </Label>
    <DatePicker
      selected={value}
      onChange={onChange}
      dateFormat={[
        'MMMM d, yyyy',
        'MM/dd/yyyy',
        'yyyy-MM-dd',
        'MMM d, yyyy',
        'MMMM dd, yyyy',
      ]}
      placeholderText={placeholder}
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      readOnly={readOnly}
      disabled={readOnly}
    />
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

export const SeniorEditDialog: React.FC<SeniorEditDialogProps> = ({ userRole, senior, queryClient, trigger }) => {
  const [open, setOpen] = React.useState(false);
  const isAdmin = userRole === 'ADMIN';

  // Fetch remarks dynamically
  const { options: remarksOptions, isLoading: isLoadingRemarks } = useRemarksOptions();

  const [editData, setEditData] = React.useState<EditFormState>({
    firstname: senior.firstname,
    middlename: senior.middlename,
    lastname: senior.lastname,
    age: parseInt(senior.age, 10) || 0,
    birthdate: senior.birthdate ? new Date(senior.birthdate) : null,
    gender: senior.gender || '',
    email: senior.email,
    contact_no: senior.contact_no || '',
    emergency_no: senior.emergency_no || '',
    barangay: senior.barangay,
    purok: senior.purok,
    pwd: senior.pwd,
    low_income: senior.low_income,
    contact_person: senior.contact_person || '',
    contact_relationship: senior.contact_relationship || '',
    releasedAt: senior.releasedAt ? new Date(senior.releasedAt) : null,
    remarks_id: senior.remarks_id, // Added remarks_id
  });

  const calculatedCategory = React.useMemo(() => {
    return determineCategoryByAge(editData.age) || 'Regular (Below 80)';
  }, [editData.age]);

  const { updateSeniorMutation } = useSeniorMutations(queryClient);

  React.useEffect(() => {
    setEditData({
      firstname: senior.firstname,
      middlename: senior.middlename,
      lastname: senior.lastname,
      age: parseInt(senior.age, 10) || 0,
      birthdate: senior.birthdate ? new Date(senior.birthdate) : null,
      gender: senior.gender || '',
      email: senior.email,
      contact_no: senior.contact_no || '',
      emergency_no: senior.emergency_no || '',
      barangay: senior.barangay,
      purok: senior.purok,
      pwd: senior.pwd,
      low_income: senior.low_income,
      contact_person: senior.contact_person || '',
      contact_relationship: senior.contact_relationship || '',
      releasedAt: senior.releasedAt ? new Date(senior.releasedAt) : null,
      remarks_id: senior.remarks_id, // Added remarks_id
    });
  }, [senior]);

  const handleUpdate = () => {
    const finalGender: 'male' | 'female' =
      editData.gender === 'male' || editData.gender === 'female' ? editData.gender : 'male';

    const payload: SeniorUpdateData = {
      id: senior.id,
      firstname: editData.firstname || '',
      middlename: editData.middlename,
      lastname: editData.lastname || '',
      age: editData.age.toString(),
      birthdate: editData.birthdate ? editData.birthdate.toISOString() : new Date().toISOString(),
      gender: finalGender,
      email: editData.email,
      contact_no: editData.contact_no || '',
      emergency_no: editData.emergency_no || '',
      barangay: editData.barangay || '',
      purok: editData.purok || '',
      pwd: editData.pwd,
      low_income: editData.low_income,
      contact_person: editData.contact_person || '',
      contact_relationship: editData.contact_relationship || '',
      remarks_id: editData.remarks_id, // Added remarks_id
      ...(isAdmin && { releasedAt: editData.releasedAt ? editData.releasedAt.toISOString() : null }),
    };

    updateSeniorMutation.mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: ['seniors', senior.id] });
        queryClient.invalidateQueries({ queryKey: ['applications'] });
      },
    });
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-md bg-background cursor-pointer text-sm ring-offset-background hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Pencil className="h-5 w-5 text-blue-600" />
    </Button>
  );

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  const seniorCitizenCategoryOptions = [
    { value: 'false', label: 'Regular Senior Citizen' },
    { value: 'true', label: 'Special Cases' }
  ];

  const shouldShowAdditionalInfoSection = senior.remarks?.name || senior.releasedAt;

  function calculateAgeFromBirthdate(date: Date | null) {
    if (!date) return 0;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Senior Profile</DialogTitle>
          <p className="text-gray-500 text-sm mt-1">
            Registered On: <span className="font-medium">{formatDateTime(senior.createdAt)}</span>
          </p>
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
                  value={editData.age?.toString()}
                  onChange={(value) => {
                    const num = parseInt(value, 10) || 0;

                    // Auto-calc birthdate from age
                    const today = new Date();
                    const newBirthYear = today.getFullYear() - num;
                    const newBirthdate = new Date(newBirthYear, today.getMonth(), today.getDate());

                    setEditData({
                      ...editData,
                      age: num,
                      birthdate: newBirthdate,
                    });
                  }}
                  type="number"
                />
                <EditableDateField
                  label="Birth Date"
                  id="birthdate"
                  value={editData.birthdate}
                  onChange={(date) => {
                    const newAge = calculateAgeFromBirthdate(date);
                    setEditData({
                      ...editData,
                      birthdate: date,
                      age: newAge,
                    });
                  }}
                />
                <EditableSelectField
                  label="Gender"
                  id="gender"
                  value={editData.gender}
                  onChange={(value) => {
                    const newGender = value === 'male' || value === 'female' ? value : '';
                    setEditData({ ...editData, gender: newGender });
                  }}
                  options={genderOptions}
                />
              </div>

              {/* Senior Citizen Category */}
              {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <EditableSelectField
                  label="Senior Citizen Category"
                  id="pwd"
                  value={editData.pwd ? 'true' : 'false'}
                  onChange={(value) => setEditData({ ...editData, pwd: value === 'true' })}
                  options={seniorCitizenCategoryOptions}
                  placeholder="Select category"
                />
              </div> */}

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="text-sm font-medium text-blue-900">
                    Age Category
                  </Label>
                  <p className="text-lg font-semibold text-blue-700 mt-1">
                    {calculatedCategory}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Category is automatically determined by age
                  </p>
                </div>
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

              {/* Email and Contact Person Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableFormField
                  label="Contact Person"
                  id="contact_person"
                  value={editData.contact_person}
                  onChange={(value) => setEditData({ ...editData, contact_person: value })}
                />
                <EditableFormField
                  label="Contact Relationships"
                  id="contact_relationship"
                  value={editData.contact_relationship}
                  onChange={(value) => setEditData({ ...editData, contact_relationship: value })}
                />
              </div>

              {/* Address Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableSelectField
                  label="Barangay"
                  id="barangay"
                  value={editData.barangay}
                  onChange={(value) => setEditData({ ...editData, barangay: value })}
                  options={SELECT_OPTIONS.barangay}
                  placeholder="Select barangay"
                />
                <EditableFormField
                  label="Lot / Block / Street / Purok"
                  id="purok"
                  value={editData.purok}
                  onChange={(value) => setEditData({ ...editData, purok: value })}
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section (Remarks and Released On) */}
          <div className="border rounded-lg">
            <SectionHeader
              icon={<StickyNoteIcon className="h-5 w-5 text-green-600" />}
              title="Additional Information"
              description="Status information and release details."
            />
            <div className="px-6 pb-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Remarks Dropdown */}
                <EditableSelectField
                  label="Remarks"
                  id="remarks"
                  value={editData.remarks_id?.toString() || ''}
                  onChange={(value) => setEditData({ ...editData, remarks_id: parseInt(value, 10) })}
                  options={remarksOptions}
                  placeholder="Select remarks"
                />

                {/* Released On Date (Admin only) */}
                {isAdmin && (
                  <EditableDateField
                    label="Released On"
                    id="releasedAt"
                    value={editData.releasedAt}
                    onChange={(date) => setEditData({ ...editData, releasedAt: date })}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleUpdate} disabled={updateSeniorMutation.isPending}>
            {updateSeniorMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};