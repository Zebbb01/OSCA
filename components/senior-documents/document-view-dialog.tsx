// components/senior-documents/document-view-dialog.tsx
'use client'

import React from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EyeOpenIcon, DownloadIcon } from '@radix-ui/react-icons'
import { RegistrationDocument, Seniors, RegistrationDocumentTag } from '@/types/seniors' // Import RegistrationDocumentTag
import { formatDateTime, formatDocumentTagName, getDownloadUrl } from '@/utils/format'
import { DocumentViewer } from './document-viewer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs' // Import Tabs components

interface DocumentViewDialogProps {
  senior: Seniors // Ensure Seniors type includes the 'documents' array
}

export const DocumentViewDialog: React.FC<DocumentViewDialogProps> = ({ senior }) => {
  if (!senior || !senior.documents || senior.documents.length === 0) {
    return <p className="text-gray-500 text-sm">No documents uploaded.</p>
  }

  // Filter documents into categories
  const otherDocuments = senior.documents.filter(
    (doc) => doc.tag !== RegistrationDocumentTag.MEDICAL_ASSISTANCE
  )
  const medicalAssistanceDocuments = senior.documents.filter(
    (doc) => doc.tag === RegistrationDocumentTag.MEDICAL_ASSISTANCE
  )

  // Determine the default tab value
  const defaultTab =
    medicalAssistanceDocuments.length > 0
      ? 'medical_assistance'
      : 'other_documents';


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          View All ({senior.documents.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-4xl h-[95vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-800">
            Documents for {senior.firstname} {senior.lastname}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Browse and download individual documents.
          </DialogDescription>
        </DialogHeader>

        {/* Tabbed Interface */}
        <Tabs defaultValue={defaultTab} className="flex flex-col flex-grow overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="other_documents">
              Required Documents ({otherDocuments.length})
            </TabsTrigger>
            <TabsTrigger value="medical_assistance">
              Medical Assistance ({medicalAssistanceDocuments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="other_documents" className="flex-grow overflow-y-auto mt-4">
            {otherDocuments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pr-2">
                {otherDocuments.map((doc: RegistrationDocument) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden"
                  >
                    <DocumentViewer
                      document={doc}
                      trigger={
                        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group">
                          {doc.imageUrl ? (
                            <>
                              <Image
                                src={doc.imageUrl}
                                alt={doc.file_name}
                                layout="fill"
                                objectFit="cover"
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                                <EyeOpenIcon className="h-8 w-8 text-white" />
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-500 text-sm">No preview</span>
                          )}
                        </div>
                      }
                    />
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h5 className="mb-1 text-lg font-semibold text-gray-900 truncate">
                          {formatDocumentTagName(doc.tag)}
                        </h5>
                        <p className="text-sm text-gray-500">Uploaded: {formatDateTime(doc.createdAt)}</p>
                      </div>
                      <div className="mt-4">
                        {doc.imageUrl ? (
                          <a
                            href={getDownloadUrl(doc.imageUrl, doc.file_name)}
                            download={doc.file_name}
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                          >
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download File
                          </a>
                        ) : (
                          <p className="text-red-600 text-xs text-center">File missing.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-8">No required documents available.</p>
            )}
          </TabsContent>

          <TabsContent value="medical_assistance" className="flex-grow overflow-y-auto mt-4">
            {medicalAssistanceDocuments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pr-2">
                {medicalAssistanceDocuments.map((doc: RegistrationDocument) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden"
                  >
                    <DocumentViewer
                      document={doc}
                      trigger={
                        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group">
                          {doc.imageUrl ? (
                            <>
                              <Image
                                src={doc.imageUrl}
                                alt={doc.file_name}
                                layout="fill"
                                objectFit="cover"
                                className="transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                                <EyeOpenIcon className="h-8 w-8 text-white" />
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-500 text-sm">No preview</span>
                          )}
                        </div>
                      }
                    />
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h5 className="mb-1 text-lg font-semibold text-gray-900 truncate">
                          {formatDocumentTagName(doc.tag)}
                        </h5>
                        <p className="text-sm text-gray-500">Uploaded: {formatDateTime(doc.createdAt)}</p>
                      </div>
                      <div className="mt-4">
                        {doc.imageUrl ? (
                          <a
                            href={getDownloadUrl(doc.imageUrl, doc.file_name)}
                            download={doc.file_name}
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                          >
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download File
                          </a>
                        ) : (
                          <p className="text-red-600 text-xs text-center">File missing.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-8">No medical assistance documents available.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}