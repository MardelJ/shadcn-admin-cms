// components/fields/field-form-sheet.tsx

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Field, FieldType } from '@/features/workspaces/collections/fields/data/schema';
import { useAddField, useUpdateField } from '@/features/workspaces/collections/fields/hooks/use-fields';
import { useCollections } from '@/features/workspaces/collections/hooks/use-collections';
import { fieldTypeHasOptions, fieldTypeHasRelationship, fieldTypeHasSlugSource, fieldTypeHasValidation, getFieldTypeConfig, getFieldTypes } from '../utils/field-utils';



// ============================================
// SCHEMA
// ============================================

const selectOptionSchema = z.object({
    value: z.string(),
    label: z.string(),
});

const fieldFormSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .regex(/^[a-z][a-z0-9_]*$/, 'Lowercase letters, numbers, and underscores only'),
    label: z.string().min(1, 'Label is required'),
    type: z.nativeEnum(FieldType),
    description: z.string().optional(),
    required: z.boolean(),
    unique: z.boolean(),

    // Config
    options: z.array(selectOptionSchema).optional(),
    relatedCollection: z.string().optional(),
    sourceField: z.string().optional(),

    // Validation
    minLength: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
    maxLength: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
    min: z.union([z.coerce.number(), z.literal('')]).optional(),
    max: z.union([z.coerce.number(), z.literal('')]).optional(),
    pattern: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldFormSchema>;

const defaultValues: FieldFormValues = {
    name: '',
    label: '',
    type: FieldType.TEXT,
    description: '',
    required: false,
    unique: false,
    options: [{ value: '', label: '' }],
    relatedCollection: '',
    sourceField: '',
    minLength: '',
    maxLength: '',
    min: '',
    max: '',
    pattern: '',
};

// ============================================
// COMPONENT
// ============================================

interface FieldFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    field?: Field;
    fields?: Field[];
    orgSlug: string;
    workspaceSlug: string;
    collectionSlug: string;
}

export function FieldFormSheet({
    open,
    onOpenChange,
    field,
    fields = [],
    orgSlug,
    workspaceSlug,
    collectionSlug,
}: FieldFormSheetProps) {
    const isEdit = !!field;
    const addField = useAddField(orgSlug, workspaceSlug, collectionSlug);
    const updateField = useUpdateField(orgSlug, workspaceSlug, collectionSlug);
    const { collections } = useCollections(orgSlug, workspaceSlug);

    const fieldTypes = getFieldTypes();

    const form = useForm<FieldFormValues>({
        resolver: zodResolver(fieldFormSchema),
        defaultValues,
    });

    const { fields: optionFields, append, remove } = useFieldArray({
        control: form.control,
        name: 'options',
    });

    const watchType = form.watch('type');
    const typeConfig = getFieldTypeConfig(watchType);

    // Reset form when opening/closing or when field changes
    useEffect(() => {
        if (open) {
            if (field) {
                const config = field.config as Record<string, unknown> | null;
                const validation = field.validation as Record<string, unknown> | null;

                form.reset({
                    name: field.name,
                    label: field.label,
                    type: field.type as FieldType,
                    description: field.description || '',
                    required: field.required,
                    unique: field.unique,
                    options:
                        Array.isArray(config?.options) && config.options.length > 0
                            ? (config.options as { value: string; label: string }[])
                            : [{ value: '', label: '' }],
                    relatedCollection: (config?.relatedCollection as string) || '',
                    sourceField: (config?.sourceField as string) || '',
                    minLength: (validation?.minLength as number) ?? '',
                    maxLength: (validation?.maxLength as number) ?? '',
                    min: (validation?.min as number) ?? '',
                    max: (validation?.max as number) ?? '',
                    pattern: (validation?.pattern as string) || '',
                });
            } else {
                form.reset(defaultValues);
            }
        }
    }, [open, field, form]);

    // Auto-generate name from label
    const handleLabelChange = (value: string) => {
        form.setValue('label', value);
        if (!isEdit && !form.getValues('name')) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_|_$/g, '');
            form.setValue('name', slug);
        }
    };

    // Auto-generate option value from label
    const handleOptionLabelChange = (index: number, label: string) => {
        form.setValue(`options.${index}.label`, label);
        const currentValue = form.getValues(`options.${index}.value`);
        if (!currentValue) {
            const value = label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            form.setValue(`options.${index}.value`, value);
        }
    };

    const onSubmit = (values: FieldFormValues) => {
        // Build config
        const config: Record<string, unknown> = {};

        if (fieldTypeHasOptions(values.type) && values.options) {
            const validOptions = values.options.filter((o) => o.value && o.label);
            if (validOptions.length > 0) {
                config.options = validOptions;
            }
        }

        if (fieldTypeHasRelationship(values.type) && values.relatedCollection) {
            config.relatedCollection = values.relatedCollection;
        }

        if (fieldTypeHasSlugSource(values.type) && values.sourceField) {
            config.sourceField = values.sourceField;
        }

        // Build validation
        const validation: Record<string, unknown> = {};

        if (values.minLength !== '' && values.minLength !== undefined) {
            validation.minLength = Number(values.minLength);
        }
        if (values.maxLength !== '' && values.maxLength !== undefined) {
            validation.maxLength = Number(values.maxLength);
        }
        if (values.min !== '' && values.min !== undefined) {
            validation.min = Number(values.min);
        }
        if (values.max !== '' && values.max !== undefined) {
            validation.max = Number(values.max);
        }
        if (values.pattern) {
            validation.pattern = values.pattern;
        }

        const payload = {
            name: values.name,
            label: values.label,
            type: values.type,
            description: values.description || undefined,
            required: values.required,
            unique: values.unique,
            config: Object.keys(config).length > 0 ? config : undefined,
            validation: Object.keys(validation).length > 0 ? validation : undefined,
        };

        if (isEdit && field) {
            updateField.mutate(
                { fieldId: field.id, ...payload },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            addField.mutate(payload, { onSuccess: () => onOpenChange(false) });
        }
    };

    const isLoading = addField.isPending || updateField.isPending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto p-4">
                <SheetHeader>
                    <SheetTitle>{isEdit ? 'Edit Field' : 'Add Field'}</SheetTitle>
                    <SheetDescription>
                        {isEdit
                            ? 'Update the field settings.'
                            : 'Define a new field for this collection.'}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="label"
                                render={({ field: formField }) => (
                                    <FormItem>
                                        <FormLabel>Label *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...formField}
                                                onChange={(e) => handleLabelChange(e.target.value)}
                                                placeholder="e.g., Title, Description"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field: formField }) => (
                                    <FormItem>
                                        <FormLabel>Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...formField}
                                                placeholder="e.g., title, description"
                                                disabled={isEdit}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Lowercase letters, numbers, and underscores only.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!isEdit && (
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>Type *</FormLabel>
                                            <Select onValueChange={formField.onChange} value={formField.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select field type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {fieldTypes.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>
                                                            <div className="flex flex-col">
                                                                <span>{t.label}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {t.description}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field: formField }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input {...formField} placeholder="Help text for content editors" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* SELECT/MULTISELECT Options */}
                        {fieldTypeHasOptions(watchType) && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <FormLabel>Options</FormLabel>
                                    <div className="space-y-2">
                                        {optionFields.map((optionField, index) => (
                                            <div key={optionField.id} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${index}.label`}
                                                    render={({ field: formField }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input
                                                                    {...formField}
                                                                    onChange={(e) =>
                                                                        handleOptionLabelChange(index, e.target.value)
                                                                    }
                                                                    placeholder="Label (displayed)"
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${index}.value`}
                                                    render={({ field: formField }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input {...formField} placeholder="Value (stored)" />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    disabled={optionFields.length === 1}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ value: '', label: '' })}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Option
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Relationship */}
                        {fieldTypeHasRelationship(watchType) && (
                            <>
                                <Separator />
                                <FormField
                                    control={form.control}
                                    name="relatedCollection"
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>Related Collection *</FormLabel>
                                            <Select onValueChange={formField.onChange} value={formField.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select collection" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {collections.map((col) => (
                                                        <SelectItem key={col.id} value={col.slug}>
                                                            {col.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {/* Slug Source */}
                        {fieldTypeHasSlugSource(watchType) && (
                            <>
                                <Separator />
                                <FormField
                                    control={form.control}
                                    name="sourceField"
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel>Source Field</FormLabel>
                                            <Select onValueChange={formField.onChange} value={formField.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select field to generate slug from" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {fields
                                                        .filter((f) => f.type === 'TEXT')
                                                        .map((f) => (
                                                            <SelectItem key={f.id} value={f.name}>
                                                                {f.label}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Slug will be auto-generated from this field.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}

                        {/* Validation */}
                        {fieldTypeHasValidation(watchType) && typeConfig?.validationOptions && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <FormLabel className="text-sm font-medium">Validation</FormLabel>

                                    {(typeConfig.validationOptions.minLength ||
                                        typeConfig.validationOptions.maxLength) && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {typeConfig.validationOptions.minLength && (
                                                    <FormField
                                                        control={form.control}
                                                        name="minLength"
                                                        render={({ field: formField }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Min Length</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...formField}
                                                                        value={formField.value ?? ''}
                                                                        placeholder="0"
                                                                        min={0}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                                {typeConfig.validationOptions.maxLength && (
                                                    <FormField
                                                        control={form.control}
                                                        name="maxLength"
                                                        render={({ field: formField }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Max Length</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...formField}
                                                                        value={formField.value ?? ''}
                                                                        placeholder="No limit"
                                                                        min={0}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        )}

                                    {(typeConfig.validationOptions.min || typeConfig.validationOptions.max) && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {typeConfig.validationOptions.min && (
                                                <FormField
                                                    control={form.control}
                                                    name="min"
                                                    render={({ field: formField }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Min Value</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...formField}
                                                                    value={formField.value ?? ''}
                                                                    placeholder="No limit"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                            {typeConfig.validationOptions.max && (
                                                <FormField
                                                    control={form.control}
                                                    name="max"
                                                    render={({ field: formField }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Max Value</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...formField}
                                                                    value={formField.value ?? ''}
                                                                    placeholder="No limit"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {typeConfig.validationOptions.pattern && (
                                        <FormField
                                            control={form.control}
                                            name="pattern"
                                            render={({ field: formField }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Pattern (RegEx)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...formField}
                                                            placeholder="e.g., ^[A-Za-z]+$"
                                                            className="font-mono text-sm"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            </>
                        )}

                        {/* Flags */}
                        <Separator />
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="required"
                                render={({ field: formField }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>Required</FormLabel>
                                            <FormDescription>Field must have a value</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={formField.value}
                                                onCheckedChange={formField.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unique"
                                render={({ field: formField }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>Unique</FormLabel>
                                            <FormDescription>Value must be unique across entries</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={formField.value}
                                                onCheckedChange={formField.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SheetFooter className="gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : isEdit ? 'Update Field' : 'Add Field'}
                            </Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}