import { Organizations } from '@/features/organizations'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const organizationsSearchSchema = z.object({
    name: z.string().optional().catch(''),
    filter: z.string().optional().catch(''),
    sort: z.enum(['asc', 'desc']).optional().catch(undefined),
})
export const Route = createFileRoute('/_authenticated/organizations/')({
    validateSearch: organizationsSearchSchema,
    component: Organizations,
})