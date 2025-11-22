// components\applicants\document-upload-form.tsx
import React, { useState, useRef, ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Assuming you use this for the remove file button

import { apiService } from '@/lib/axios';
import { PUTApiResponse } from '@/types/api';

interface DocumentUploadFormProps {
  applicant: any; // Consider creating a specific type for applicant
  queryClient: ReturnType<typeof useQueryClient>;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  applicant,
  queryClient,
}) => {
  const [medicalAssistanceFiles, setMedicalAssistanceFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [benefitRequirements, setBenefitRequirements] = useState<any[]>([]);
  const [isRequirementsLoading, setIsRequirementsLoading] = useState<boolean>(false);

  // Fetch requirements when component mounts or applicant changes
  React.useEffect(() => {
    if (applicant?.benefit?.id) {
      setIsRequirementsLoading(true);
      apiService
        .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/?benefit_id=${applicant.benefit.id}`)
        .then((resp) => {
          setBenefitRequirements(resp as any[] || []);
        })
        .catch((err) => {
          setBenefitRequirements([]);
          toast.error('Failed to fetch benefit requirements.');
          console.error('Error fetching benefit requirements:', err);
        })
        .finally(() => setIsRequirementsLoading(false));
    }
  }, [applicant?.benefit?.id]);

  const uploadDocumentsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiService.post<PUTApiResponse>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`, formData);
      return res.data || {};
    },
    onSuccess: (resp: any) => {
      console.log('Response from document upload:', resp);
      const successMessage =
        typeof resp === 'object' && resp !== null && 'message' in resp
          ? resp.message
          : 'Medical documents uploaded successfully!';

      toast.success(successMessage, {
        description: 'The files have been securely saved for the selected senior.',
      });

      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['seniors'] });
      queryClient.invalidateQueries({ queryKey: ['seniors-documents'] });
      resetDocumentForm();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || error.message || 'An unknown error occurred during upload.';
      toast.error('Failed to upload documents.', {
        description: errorMessage,
      });
      console.error('Document upload error:', error);
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMedicalAssistanceFiles(Array.from(event.target.files));
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setMedicalAssistanceFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    if (fileInputRef.current && medicalAssistanceFiles.length === 1 && indexToRemove === 0) {
      fileInputRef.current.value = '';
    }
  };

  const resetDocumentForm = () => {
    setMedicalAssistanceFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDocumentUploadSubmit = () => {
    if (medicalAssistanceFiles.length === 0) {
      toast.warning('Please select at least one document to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('id', applicant.senior.id.toString());
    medicalAssistanceFiles.forEach((file) => {
      formData.append('medical_assistance', file);
    });

    uploadDocumentsMutation.mutate(formData);
  };

  return (
    <div className="grid grid-cols-1 gap-4 py-4">
      <Label htmlFor="medical_documents" className="text-sm font-medium text-gray-700">
        Upload Documents:
      </Label>
      <Input
        id="medical_documents"
        type="file"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        className="file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-green-600 file:text-white hover:file:bg-green-700"
        disabled={uploadDocumentsMutation.isPending}
      />

      {medicalAssistanceFiles.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-semibold mb-1">Selected Files ({medicalAssistanceFiles.length}):</p>
          <ul className="space-y-1">
            {medicalAssistanceFiles.map((file, index) => (
              <li
                key={file.name + index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
              >
                <span className="flex items-center gap-2 truncate pr-4">
                  <FontAwesomeIcon icon={faFileAlt} className="text-green-500" />
                  <span className="truncate">{file.name}</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploadDocumentsMutation.isPending}
                  className="text-gray-400 hover:text-red-500 p-1 h-auto"
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Benefit Requirements:</h3>
        {isRequirementsLoading ? (
          <p>Loading requirements...</p>
        ) : (
          <ul className="list-disc list-inside text-sm text-gray-700">
            {benefitRequirements && benefitRequirements.length > 0 ? (
              benefitRequirements.map((req, index) => <li key={index}>{req.name}</li>)
            ) : (
              <li>No specific requirements found for this benefit.</li>
            )}
          </ul>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button
          type="button"
          onClick={handleDocumentUploadSubmit}
          disabled={uploadDocumentsMutation.isPending || medicalAssistanceFiles.length === 0}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {uploadDocumentsMutation.isPending ? 'Uploading...' : 'Upload Documents'}
        </Button>
      </div>
    </div>
  );
};