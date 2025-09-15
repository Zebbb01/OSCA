// schema\benefit\benefit.schema.ts
import z from 'zod'

export const benefitFormSchema = z.object({
    name: z.string().min(1, 'Benefit Name is required'),
    description: z.string().min(1, 'Description is required'),
    tag: z.string().min(1, 'Tag is required'),
    requirements: z
        .array(
            z.object({
                name: z.string().min(1, 'Requirement name is required'),
            })
        )
        .min(1, 'At least one requirement is required'),
})

export type BenefitFormData = z.infer<typeof benefitFormSchema>

export const benefitApplicationSchema = z.object({
    benefit_id: z.number(),
    selected_senior_ids: z.array(z.number()),
    status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
})

// Optional: Infer TypeScript type from schema
export type BenefitApplicationFormData = z.infer<typeof benefitApplicationSchema>
