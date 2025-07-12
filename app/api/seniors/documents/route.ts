import cloudinary from '@/lib/cloudinary'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
    try {

        const seniors = await prisma.senior.findMany({
            select: {
                id: true,
                firstname: true,
                lastname: true,
                middlename: true,
                email: true,
                documents: true,
            },
        })

        const seniorsWithFiles = await Promise.all(
            seniors.map(async (senior) => {
                const documentWithURLs = await Promise.all(
                    senior.documents.map(async (doc) => {
                        try {
                            const publicId = `${doc.path}/${doc.file_name}`
                            const result = await cloudinary.api.resource(publicId)

                            return {
                                ...doc,
                                imageUrl: result.secure_url,
                            }

                        } catch (error) {
                            console.error('Cloudinary fetch error:', error)
                            return {
                                ...doc,
                                imageUrl: null,
                            }
                        }
                    })

                )

                return {
                    ...senior,
                    documents: documentWithURLs
                }
            })
        )

        return NextResponse.json(seniorsWithFiles)

    } catch (error) {
        console.error('GET /api/senior error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch seniors', error: String(error) },
            { status: 500 }
        )
    }
}
