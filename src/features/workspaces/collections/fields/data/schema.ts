/* eslint-disable @typescript-eslint/no-explicit-any */
import z from 'zod'

export enum FieldType {
    TEXT = 'TEXT',
    TEXTAREA = 'TEXTAREA',
    RICHTEXT = 'RICHTEXT',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    SELECT = 'SELECT',
    MULTISELECT = 'MULTISELECT',
    MEDIA = 'MEDIA',
    RELATIONSHIP = 'RELATIONSHIP',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    JSON = 'JSON',
    SLUG = 'SLUG',
    EMAIL = 'EMAIL',
    URL = 'URL',
    COLOR = 'COLOR',
    PASSWORD = 'PASSWORD',
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
    config: z.record(z.string(), z.any()),
    validation: z.record(z.string(), z.any()),
    defaultValue: z.any().nullable(),
    sortOrder: z.number(),
    hidden: z.boolean(),
    readOnly: z.boolean(),
    adminOnly: z.boolean(),
    conditions: z.record(z.string(), z.any()).nullable(),
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

export interface UpdateFieldRequest {
    label?: string
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


export interface FieldTypeConfig {
    value: FieldType
    label: string
    description: string
    icon: string
    color: string
    bgColor: string
    // Features
    hasOptions: boolean           // SELECT, MULTISELECT
    hasValidation: boolean        // TEXT, TEXTAREA, NUMBER, etc.
    hasDefaultValue: boolean      // Most fields
    hasRelationship: boolean      // RELATIONSHIP
    hasMediaConfig: boolean       // MEDIA
    hasSlugSource: boolean        // SLUG
    // Validation options available
    validationOptions?: {
        minLength?: boolean
        maxLength?: boolean
        min?: boolean
        max?: boolean
        pattern?: boolean
        allowedTypes?: boolean    // MEDIA
        maxSize?: boolean         // MEDIA
    }
}

export const FIELD_TYPE_CONFIG: Record<FieldType, FieldTypeConfig> = {
    [FieldType.TEXT]: {
        value: FieldType.TEXT,
        label: 'Text',
        description: 'Single line text input',
        icon: 'Type',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
        hasOptions: false,
        hasValidation: true,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
        validationOptions: {
            minLength: true,
            maxLength: true,
            pattern: true,
        },
    },
    [FieldType.TEXTAREA]: {
        value: FieldType.TEXTAREA,
        label: 'Text Area',
        description: 'Multi-line text input',
        icon: 'AlignLeft',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
        hasOptions: false,
        hasValidation: true,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
        validationOptions: {
            minLength: true,
            maxLength: true,
        },
    },
    [FieldType.RICHTEXT]: {
        value: FieldType.RICHTEXT,
        label: 'Rich Text',
        description: 'Rich text editor with formatting',
        icon: 'FileText',
        color: 'text-purple-800',
        bgColor: 'bg-purple-100',
        hasOptions: false,
        hasValidation: true,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
        validationOptions: {
            minLength: true,
            maxLength: true,
        },
    },
    [FieldType.NUMBER]: {
        value: FieldType.NUMBER,
        label: 'Number',
        description: 'Numeric input (integer or decimal)',
        icon: 'Hash',
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        hasOptions: false,
        hasValidation: true,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
        validationOptions: {
            min: true,
            max: true,
        },
    },
    [FieldType.BOOLEAN]: {
        value: FieldType.BOOLEAN,
        label: 'Boolean',
        description: 'True/False toggle',
        icon: 'ToggleLeft',
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100',
        hasOptions: false,
        hasValidation: false,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.DATE]: {
        value: FieldType.DATE,
        label: 'Date',
        description: 'Date picker (without time)',
        icon: 'Calendar',
        color: 'text-orange-800',
        bgColor: 'bg-orange-100',
        hasOptions: false,
        hasValidation: false,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.DATETIME]: {
        value: FieldType.DATETIME,
        label: 'Date & Time',
        description: 'Date and time picker',
        icon: 'Clock',
        color: 'text-orange-800',
        bgColor: 'bg-orange-100',
        hasOptions: false,
        hasValidation: false,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.SELECT]: {
        value: FieldType.SELECT,
        label: 'Select',
        description: 'Dropdown with predefined options',
        icon: 'ChevronDown',
        color: 'text-pink-800',
        bgColor: 'bg-pink-100',
        hasOptions: true,
        hasValidation: false,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.MULTISELECT]: {
        value: FieldType.MULTISELECT,
        label: 'Multi Select',
        description: 'Multiple selection from options',
        icon: 'CheckSquare',
        color: 'text-pink-800',
        bgColor: 'bg-pink-100',
        hasOptions: true,
        hasValidation: false,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.MEDIA]: {
        value: FieldType.MEDIA,
        label: 'Media',
        description: 'Image, video, or file upload',
        icon: 'Image',
        color: 'text-indigo-800',
        bgColor: 'bg-indigo-100',
        hasOptions: false,
        hasValidation: true,
        hasDefaultValue: false,
        hasRelationship: false,
        hasMediaConfig: true,
        hasSlugSource: false,
        validationOptions: {
            allowedTypes: true,
            maxSize: true,
        },
    },
    [FieldType.RELATIONSHIP]: {
        value: FieldType.RELATIONSHIP,
        label: 'Relationship',
        description: 'Reference to another collection',
        icon: 'Link',
        color: 'text-cyan-800',
        bgColor: 'bg-cyan-100',
        hasOptions: false,
        hasValidation: false,
        hasDefaultValue: false,
        hasRelationship: true,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.ARRAY]: {
        value: FieldType.ARRAY,
        label: 'Array',
        description: 'List of values',
        icon: 'List',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        hasOptions: false,
        hasValidation: false,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.OBJECT]: {
        value: FieldType.OBJECT,
        label: 'Object',
        description: 'Nested object structure',
        icon: 'Braces',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        hasOptions: false,
        hasValidation: false,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.JSON]: {
        value: FieldType.JSON,
        label: 'JSON',
        description: 'Raw JSON data',
        icon: 'Code',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        hasOptions: false,
        hasValidation: false,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.SLUG]: {
        value: FieldType.SLUG,
        label: 'Slug',
        description: 'URL-friendly identifier',
        icon: 'Link2',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        hasOptions: false,
        hasValidation: true,
        hasDefaultValue: false,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: true,
        validationOptions: {
            maxLength: true,
        },
    },
    [FieldType.EMAIL]: {
        value: FieldType.EMAIL,
        label: 'Email',
        description: 'Email address input',
        icon: 'Mail',
        color: 'text-teal-800',
        bgColor: 'bg-teal-100',
        hasOptions: false,
        hasValidation: true,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
        validationOptions: {
            pattern: true,
        },
    },
    [FieldType.URL]: {
        value: FieldType.URL,
        label: 'URL',
        description: 'Web address input',
        icon: 'Globe',
        color: 'text-teal-800',
        bgColor: 'bg-teal-100',
        hasOptions: false,
        hasValidation: true,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
        validationOptions: {
            pattern: true,
        },
    },
    [FieldType.COLOR]: {
        value: FieldType.COLOR,
        label: 'Color',
        description: 'Color picker',
        icon: 'Palette',
        color: 'text-rose-800',
        bgColor: 'bg-rose-100',
        hasOptions: false,
        hasValidation: false,
        hasDefaultValue: true,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
    },
    [FieldType.PASSWORD]: {
        value: FieldType.PASSWORD,
        label: 'Password',
        description: 'Masked password input',
        icon: 'Lock',
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        hasOptions: false,
        hasValidation: true,
        hasDefaultValue: false,
        hasRelationship: false,
        hasMediaConfig: false,
        hasSlugSource: false,
        validationOptions: {
            minLength: true,
            maxLength: true,
            pattern: true,
        },
    },
}