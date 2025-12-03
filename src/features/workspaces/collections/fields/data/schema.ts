import z from 'zod'

export enum FieldType {
    TEXT = 'TEXT',
    TEXTAREA = 'TEXTAREA',
    RICH_TEXT = 'RICH_TEXT',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
    EMAIL = 'EMAIL',
    URL = 'URL',
    SELECT = 'SELECT',
    MULTI_SELECT = 'MULTI_SELECT',
    MEDIA = 'MEDIA',
    RELATION = 'RELATION',
    JSON = 'JSON',
}

export const fieldSchema = z.object({
    id: z.string(),
    collectionId: z.string(),
    name: z.string(),
    label: z.string(),
    type: z.nativeEnum(FieldType),
    description: z.string().nullable(),
    required: z.boolean(),
    unique: z.boolean(),
    config: z.record(z.any()),
    validation: z.record(z.any()),
    defaultValue: z.any().nullable(),
    sortOrder: z.number(),
    hidden: z.boolean(),
    readOnly: z.boolean(),
    adminOnly: z.boolean(),
    conditions: z.record(z.any()).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Field = z.infer<typeof fieldSchema>

export interface CreateFieldRequest {
    name: string
    label: string
    type: FieldType
    description?: string
    required?: boolean
    unique?: boolean
    config?: Record<string, any>
    validation?: Record<string, any>
    defaultValue?: any
    hidden?: boolean
    readOnly?: boolean
    adminOnly?: boolean
}