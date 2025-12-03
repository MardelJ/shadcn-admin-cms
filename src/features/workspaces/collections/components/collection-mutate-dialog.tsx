import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { Loader2 } from 'lucide-react'
import { type Collection } from '../data/schema'
import { useCreateCollection, useUpdateCollection } from '../hooks/use-collections'

type CollectionMutateDialogProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    organizationSlug: string
    workspaceSlug: string
    currentRow?: Collection
}

const formSchema = z.object({
    name: z.string().min(1, 'Collection name is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(
            /^[a-z0-9-_]+$/,
            'Slug must contain only lowercase letters, numbers, hyphens, and underscores'
        ),
    description: z.string().optional(),
    icon: z.string().optional(),
})

type CollectionForm = z.infer<typeof formSchema>

export function CollectionMutateDialog({
    isOpen,
    onOpenChange,
    organizationSlug,
    workspaceSlug,
    currentRow,
}: CollectionMutateDialogProps) {
    const isUpdate = !!currentRow
    const createCollection = useCreateCollection(organizationSlug, workspaceSlug)
    const updateCollection = useUpdateCollection(organizationSlug, workspaceSlug)

    const form = useForm<CollectionForm>({
        resolver: zodResolver(formSchema),
        defaultValues: currentRow ?? {
            name: '',
            slug: '',
            description: '',
            icon: '',
        },
    })

    const onSubmit = (data: CollectionForm) => {
        if (isUpdate) {
            updateCollection.mutate(
                {
                    id: currentRow.id,
                    ...data,
                },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        form.reset()
                    },
                }
            )
        } else {
            createCollection.mutate(data, {
                onSuccess: () => {
                    onOpenChange(false)
                    form.reset()
                },
            })
        }
    }

    const isLoading = createCollection.isPending || updateCollection.isPending

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                onOpenChange(v)
                form.reset()
            }}
        >
            <DialogContent className='sm:max-w-md'>
                <DialogHeader className='text-start'>
                    <DialogTitle>
                        {isUpdate ? 'Update' : 'Create'} Collection
                    </DialogTitle>
                    <DialogDescription>
                        {isUpdate
                            ? 'Update the collection by providing necessary info.'
                            : 'Add a new collection by providing necessary info.'}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id='collection-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Collection Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='Blog Posts' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='slug'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder='blog-posts'
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    .toLowerCase()
                                                    .replace(/\s+/g, '-')
                                                field.onChange(value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Used in API endpoints and URLs
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='icon'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon (Optional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='📝' maxLength={2} />
                                    </FormControl>
                                    <FormDescription>
                                        Single emoji to represent this collection
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder='A brief description of this collection'
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter className='gap-2'>
                    <DialogClose asChild>
                        <Button variant='outline' disabled={isLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button form='collection-form' type='submit' disabled={isLoading}>
                        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        {isUpdate ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}