import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { type Entry, useCreateEntry, useUpdateEntry } from '../hooks/use-entries'
import { type Field } from '@/features/workspaces/collections/hooks/use-collections'

// ============================================
// DYNAMIC SCHEMA BUILDER
// ============================================

function buildEntrySchema(fields: Field[]) {
    const shape: Record<string, z.ZodTypeAny> = {}

    for (const field of fields) {
        let fieldSchema: z.ZodTypeAny

        switch (field.type) {
            case 'TEXT':
            case 'TEXTAREA':
            case 'RICHTEXT':
            case 'SLUG':
            case 'EMAIL':
            case 'URL':
            case 'COLOR':
            case 'PASSWORD':
                fieldSchema = z.string()
                break

            case 'NUMBER':
                fieldSchema = z.union([z.coerce.number(), z.literal('')])
                break

            case 'BOOLEAN':
                fieldSchema = z.boolean()
                break

            case 'DATE':
            case 'DATETIME':
                fieldSchema = z.string()
                break

            case 'SELECT':
                fieldSchema = z.string()
                break

            case 'MULTISELECT':
                fieldSchema = z.array(z.string())
                break

            case 'JSON':
            case 'OBJECT':
                fieldSchema = z.union([
                    z.string(),
                    z.object({}).passthrough(),
                    z.array(z.unknown())
                ]).refine((value) => {
                    if (typeof value === 'string') {
                        try {
                            JSON.parse(value)
                            return true
                        } catch {
                            return false
                        }
                    }
                    return true
                }, {
                    message: 'Invalid JSON format'
                })
                break

            case 'ARRAY':
                fieldSchema = z.union([
                    z.string(),
                    z.array(z.unknown())
                ]).refine((value) => {
                    if (typeof value === 'string') {
                        try {
                            const parsed = JSON.parse(value)
                            return Array.isArray(parsed)
                        } catch {
                            return false
                        }
                    }
                    return Array.isArray(value)
                }, {
                    message: 'Must be a valid JSON array'
                })
                break

            default:
                fieldSchema = z.string()
        }

        // Make optional if not required
        if (!field.required) {
            fieldSchema = fieldSchema.optional().nullable()
        }

        shape[field.name] = fieldSchema
    }

    return z.object(shape)
}

function buildDefaultValues(fields: Field[], entry?: Entry): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}

    for (const field of fields) {
        let value: unknown

        if (entry?.data) {
            const entryValue = (entry.data as Record<string, unknown>)[field.name]

            // Handle JSON/ARRAY fields that might be stored as strings
            if ((field.type === 'JSON' || field.type === 'ARRAY' || field.type === 'OBJECT') &&
                typeof entryValue === 'string') {
                try {
                    value = JSON.parse(entryValue)
                } catch {
                    value = entryValue
                }
            } else {
                value = entryValue ?? getFieldDefault(field)
            }
        } else {
            value = getFieldDefault(field)
        }

        defaults[field.name] = value
    }

    return defaults
}

function getFieldDefault(field: Field): unknown {
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
        return field.defaultValue
    }

    switch (field.type) {
        case 'BOOLEAN':
            return false
        case 'NUMBER':
            return ''
        case 'MULTISELECT':
        case 'ARRAY':
            return []
        case 'OBJECT':
        case 'JSON':
            return {}
        default:
            return ''
    }
}

// ============================================
// COMPONENT
// ============================================

interface EntryFormSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    fields: Field[]
    entry?: Entry
    orgSlug: string
    workspaceSlug: string
    collectionSlug: string
}

export function EntryFormSheet({
    open,
    onOpenChange,
    fields,
    entry,
    orgSlug,
    workspaceSlug,
    collectionSlug,
}: EntryFormSheetProps) {
    const isEdit = !!entry
    const createEntry = useCreateEntry(orgSlug, workspaceSlug, collectionSlug)
    const updateEntry = useUpdateEntry(orgSlug, workspaceSlug, collectionSlug)

    // Filter editable fields
    const editableFields = useMemo(() =>
        fields.filter((f) => !f.hidden && !f.readOnly).sort((a, b) => a.sortOrder - b.sortOrder),
        [fields]
    )

    // Build schema and defaults
    const schema = buildEntrySchema(editableFields)
    const defaultValues = buildDefaultValues(editableFields, entry)

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    })

    // Reset form when opening or entry changes
    useEffect(() => {
        if (open) {
            form.reset(buildDefaultValues(editableFields, entry))
        }
    }, [open, entry, editableFields])

    const onSubmit = (values: Record<string, unknown>) => {
        // Clean up empty strings for optional fields and handle JSON parsing
        const cleanedData: Record<string, unknown> = {}

        for (const [key, value] of Object.entries(values)) {
            const field = editableFields.find(f => f.name === key)

            if (value === '' || value === null || value === undefined) {
                cleanedData[key] = null
            } else if (field?.type === 'JSON' || field?.type === 'ARRAY' || field?.type === 'OBJECT') {
                // For JSON/ARRAY fields, ensure we're sending the parsed value
                // If it's already an object/array, use it directly
                if (typeof value === 'object' || Array.isArray(value)) {
                    cleanedData[key] = value
                } else if (typeof value === 'string' && value.trim()) {
                    try {
                        // Try to parse string values
                        cleanedData[key] = JSON.parse(value)
                    } catch {
                        // If it's not valid JSON, send as string
                        cleanedData[key] = value
                    }
                } else {
                    cleanedData[key] = value
                }
            } else {
                cleanedData[key] = value
            }
        }

        if (isEdit && entry) {
            updateEntry.mutate(
                { entryId: entry.id, data: cleanedData },
                { onSuccess: () => onOpenChange(false) }
            )
        } else {
            createEntry.mutate(
                { data: cleanedData, status: 'DRAFT' },
                { onSuccess: () => onOpenChange(false) }
            )
        }
    }

    const isLoading = createEntry.isPending || updateEntry.isPending

    const renderFieldInput = (field: Field) => {
        const config = field.config as Record<string, unknown> | null

        switch (field.type) {
            case 'TEXT':
            case 'EMAIL':
            case 'URL':
            case 'SLUG':
            case 'PASSWORD':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormControl>
                                    <Input
                                        {...formField}
                                        value={(formField.value as string) ?? ''}
                                        type={field.type === 'PASSWORD' ? 'password' : field.type === 'EMAIL' ? 'email' : 'text'}
                                        placeholder={field.label}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'TEXTAREA':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormControl>
                                    <Textarea
                                        {...formField}
                                        value={(formField.value as string) ?? ''}
                                        placeholder={field.label}
                                        rows={4}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'RICHTEXT':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormControl>
                                    <Textarea
                                        {...formField}
                                        value={(formField.value as string) ?? ''}
                                        placeholder={`${field.label} (HTML supported)`}
                                        rows={8}
                                        className="font-mono text-sm"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'NUMBER':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...formField}
                                        value={formField.value ?? 0}
                                        placeholder={field.label}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'BOOLEAN':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </FormLabel>
                                    {field.description && <FormDescription>{field.description}</FormDescription>}
                                </div>
                                <FormControl>
                                    <Switch checked={formField.value as boolean} onCheckedChange={formField.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )

            case 'DATE':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...formField}
                                        value={formField.value ? String(formField.value).split('T')[0] : ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'DATETIME':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        {...formField}
                                        value={formField.value ? String(formField.value).slice(0, 16) : ''}
                                        onChange={(e) => {
                                            const date = e.target.value ? new Date(e.target.value).toISOString() : ''
                                            formField.onChange(date)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'SELECT':
                const selectOptions = (config?.options as { value: string; label: string }[]) || []
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <Select onValueChange={formField.onChange} value={(formField.value as string) ?? ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Select ${field.label}`} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {selectOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'COLOR':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Input
                                            type="color"
                                            value={(formField.value as string) || '#000000'}
                                            onChange={formField.onChange}
                                            className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                    </FormControl>
                                    <Input
                                        value={(formField.value as string) || ''}
                                        onChange={formField.onChange}
                                        placeholder="#000000"
                                        className="flex-1"
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )

            case 'JSON':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => {
                            // Handle both string and object values
                            const value = formField.value || ''
                            const displayValue = typeof value === 'string'
                                ? value
                                : JSON.stringify(value, null, 2)

                            return (
                                <FormItem>
                                    <FormLabel>
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </FormLabel>
                                    {field.description && <FormDescription>{field.description}</FormDescription>}
                                    <FormControl>
                                        <Textarea
                                            value={displayValue}
                                            onChange={(e) => {
                                                const input = e.target.value
                                                if (!input.trim()) {
                                                    formField.onChange(null)
                                                    return
                                                }
                                                try {
                                                    // Try to parse as JSON
                                                    const parsed = JSON.parse(input)
                                                    formField.onChange(parsed)
                                                } catch {
                                                    // If it's not valid JSON, store as string
                                                    formField.onChange(input)
                                                }
                                            }}
                                            onBlur={() => {
                                                // Validate on blur
                                                const value = formField.value
                                                if (typeof value === 'string' && value.trim()) {
                                                    try {
                                                        JSON.parse(value)
                                                    } catch (error) {
                                                        // Could show validation error here
                                                    }
                                                }
                                            }}
                                            placeholder="JSON data"
                                            rows={8}
                                            className="font-mono text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                )

            case 'ARRAY':
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => {
                            // Handle both string and array values
                            const value = formField.value || []
                            const displayValue = Array.isArray(value)
                                ? JSON.stringify(value, null, 2)
                                : String(value)

                            return (
                                <FormItem>
                                    <FormLabel>
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </FormLabel>
                                    {field.description && <FormDescription>{field.description}</FormDescription>}
                                    <FormControl>
                                        <Textarea
                                            value={displayValue}
                                            onChange={(e) => {
                                                const input = e.target.value
                                                if (!input.trim()) {
                                                    formField.onChange([])
                                                    return
                                                }
                                                try {
                                                    const parsed = JSON.parse(input)
                                                    if (Array.isArray(parsed)) {
                                                        formField.onChange(parsed)
                                                    } else {
                                                        // If parsed but not an array, wrap it
                                                        formField.onChange([parsed])
                                                    }
                                                } catch {
                                                    // If not valid JSON, treat as single-element array
                                                    formField.onChange([input])
                                                }
                                            }}
                                            placeholder={"JSON array format: [\" item1\", \"item2\", ...] or [{\"key\": \"value\"}, ...]"}
                                            rows={6}
                                            className="font-mono text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                )
            default:
                return (
                    <FormField
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </FormLabel>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormControl>
                                    <Input
                                        {...formField}
                                        value={(formField.value as string) ?? ''}
                                        placeholder={field.label}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl p-4 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEdit ? 'Edit Entry' : 'Create Entry'}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? 'Update the entry data below.' : 'Fill in the fields to create a new entry.'}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
                        {editableFields.map((field) => (
                            <div key={field.id}>{renderFieldInput(field)}</div>
                        ))}

                        <SheetFooter className="gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : isEdit ? 'Update Entry' : 'Create Entry'}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}