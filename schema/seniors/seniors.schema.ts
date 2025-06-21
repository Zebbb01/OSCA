import z from 'zod';

export const seniorsFormSchema = z.object({
    firstName: z.string().nonempty('First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().nonempty('Last name is required'),

    // Email is optional and can be an empty string
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),

    contactNumber: z.string()
        .regex(/^\d{11}$/, 'Contact number must be exactly 11 digits')
        .nonempty('Contact Number is required'),
    emergencyNumber: z.string()
        .regex(/^\d{11}$/, 'Emergency contact must be exactly 11 digits')
        .nonempty('Emergency Contact is required'),
    contactPerson: z.string().nonempty('Contact Person is required'),
    
    age: z.string()
        .refine((val) => {
            const num = parseInt(val);
            return num >= 60 && num <= 100;
        }, 'Age must be between 60 and 100'),
    birthDate: z.string()
        .regex(/^(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])\/(19|20)\d{2}$/, 'Birth Date must be in MM/DD/YYYY format')
        .nonempty('Birth Date is required'),

    gender: z.string().nonempty('Gender is required'),
    barangay: z.string().nonempty('Barangay is required'),
    purok: z.string().nonempty('Purok is required'),
    pwd: z.boolean().optional(),
}).superRefine((data, ctx) => {
    // Check if contactNumber and emergencyNumber are the same
    if (data.contactNumber && data.emergencyNumber && data.contactNumber === data.emergencyNumber) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Emergency Contact must be different from Contact Number.',
            path: ['emergencyNumber'], // Add error to emergencyNumber field
        });
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Contact Number must be different from Emergency Contact.',
            path: ['contactNumber'], // Add error to contactNumber field
        });
    }
});

export type SeniorsFormData = z.infer<typeof seniorsFormSchema>;