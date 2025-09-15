// types\benefits.ts
export type BenefitRequirement = {
    id: number
    name: string
}

export type Benefit = {
    id: number
    name: string
    description: string
    tag: string
    benefit_requirements: BenefitRequirement[]
}


