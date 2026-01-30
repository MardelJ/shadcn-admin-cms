import { FIELD_TYPE_CONFIG, type FieldTypeConfig, type FieldType } from "@/features/workspaces/collections/fields/data/schema"

export const FIELD_TYPE_LABELS: Record<string, string> = {
    TEXT: 'Text',
    TEXTAREA: 'Text Area',
    RICHTEXT: 'Rich Text',
    NUMBER: 'Number',
    BOOLEAN: 'Boolean',
    DATE: 'Date',
    DATETIME: 'Date & Time',
    SELECT: 'Select',
    MULTISELECT: 'Multi Select',
    MEDIA: 'Media',
    RELATIONSHIP: 'Relationship',
    ARRAY: 'Array',
    OBJECT: 'Object',
    JSON: 'JSON',
    SLUG: 'Slug',
    EMAIL: 'Email',
    URL: 'URL',
    COLOR: 'Color',
    PASSWORD: 'Password',
}

export const FIELD_TYPE_COLORS: Record<string, string> = {
    TEXT: 'bg-blue-100 text-blue-800',
    TEXTAREA: 'bg-blue-100 text-blue-800',
    RICHTEXT: 'bg-purple-100 text-purple-800',
    NUMBER: 'bg-green-100 text-green-800',
    BOOLEAN: 'bg-yellow-100 text-yellow-800',
    DATE: 'bg-orange-100 text-orange-800',
    DATETIME: 'bg-orange-100 text-orange-800',
    SELECT: 'bg-pink-100 text-pink-800',
    MULTISELECT: 'bg-pink-100 text-pink-800',
    MEDIA: 'bg-indigo-100 text-indigo-800',
    RELATIONSHIP: 'bg-cyan-100 text-cyan-800',
    SLUG: 'bg-gray-100 text-gray-800',
    EMAIL: 'bg-teal-100 text-teal-800',
    URL: 'bg-teal-100 text-teal-800',
}


export function getFieldTypeConfig(type: FieldType | string): FieldTypeConfig | undefined {
    return FIELD_TYPE_CONFIG[type as FieldType]
}

export function getFieldTypeLabel(type: FieldType | string): string {
    return FIELD_TYPE_CONFIG[type as FieldType]?.label || type
}

export function getFieldTypeColor(type: FieldType | string): string {
    const config = FIELD_TYPE_CONFIG[type as FieldType]
    return config ? `${config.bgColor} ${config.color}` : 'bg-gray-100 text-gray-800'
}

export function getFieldTypeIcon(type: FieldType | string): string {
    return FIELD_TYPE_CONFIG[type as FieldType]?.icon || 'HelpCircle'
}

export function getFieldTypes(): { value: FieldType; label: string; description: string }[] {
    return Object.values(FIELD_TYPE_CONFIG).map(({ value, label, description }) => ({
        value,
        label,
        description,
    }))
}

export function getFieldTypesWithOptions(): FieldType[] {
    return Object.values(FIELD_TYPE_CONFIG)
        .filter((config) => config.hasOptions)
        .map((config) => config.value)
}

export function getFieldTypesWithValidation(): FieldType[] {
    return Object.values(FIELD_TYPE_CONFIG)
        .filter((config) => config.hasValidation)
        .map((config) => config.value)
}

export function fieldTypeHasOptions(type: FieldType | string): boolean {
    return FIELD_TYPE_CONFIG[type as FieldType]?.hasOptions || false
}

export function fieldTypeHasValidation(type: FieldType | string): boolean {
    return FIELD_TYPE_CONFIG[type as FieldType]?.hasValidation || false
}

export function fieldTypeHasRelationship(type: FieldType | string): boolean {
    return FIELD_TYPE_CONFIG[type as FieldType]?.hasRelationship || false
}

export function fieldTypeHasMediaConfig(type: FieldType | string): boolean {
    return FIELD_TYPE_CONFIG[type as FieldType]?.hasMediaConfig || false
}

export function fieldTypeHasSlugSource(type: FieldType | string): boolean {
    return FIELD_TYPE_CONFIG[type as FieldType]?.hasSlugSource || false
}

// ============================================
// SELECT OPTION TYPE
// ============================================

export interface SelectOption {
    value: string
    label: string
    color?: string
    icon?: string
}

// ============================================
// FIELD CONFIG TYPES (for config field)
// ============================================

export interface SelectFieldConfig {
    options: SelectOption[]
    allowCustom?: boolean
}

export interface MediaFieldConfig {
    allowedTypes?: string[]  // ['image/*', 'video/*', 'application/pdf']
    maxSize?: number         // in bytes
    multiple?: boolean
}

export interface RelationshipFieldConfig {
    relatedCollection: string  // collection slug or id
    displayField?: string      // field to display (default: title or name)
    multiple?: boolean
}

export interface SlugFieldConfig {
    sourceField: string        // field to generate slug from (e.g., 'title')
    prefix?: string
    suffix?: string
}

export interface NumberFieldConfig {
    decimal?: boolean
    precision?: number
    step?: number
}

// ============================================
// VALIDATION CONFIG TYPES
// ============================================

export interface TextValidation {
    minLength?: number
    maxLength?: number
    pattern?: string
    patternMessage?: string
}

export interface NumberValidation {
    min?: number
    max?: number
}

export interface MediaValidation {
    allowedTypes?: string[]
    maxSize?: number
}