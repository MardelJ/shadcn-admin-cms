import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLoaderData } from '@tanstack/react-router'
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
import { type Workspace } from '../data/schema'
import { useCreateWorkspace, useUpdateWorkspace } from '../hooks.use-workspace'

type WorkspaceMutateDialogProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: Workspace
}

const formSchema = z.object({
    name: z.string().min(1, 'Workspace name is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(
            /^[a-z0-9-]+$/,
            'Slug must contain only lowercase letters, numbers, and hyphens'
        ),
    description: z.string().optional(),
})

type WorkspaceForm = z.infer<typeof formSchema>

export function WorkspaceMutateDialog({
    isOpen,
    onOpenChange,
    currentRow,
}: WorkspaceMutateDialogProps) {
    const isUpdate = !!currentRow

    const { organization } = useLoaderData({
        from: '/_authenticated/organizations/$slug',
    })
    const createWorkspace = useCreateWorkspace(organization.data.slug)
    const updateWorkspace = useUpdateWorkspace(organization.data.slug)

    const form = useForm<WorkspaceForm>({
        resolver: zodResolver(formSchema),
        defaultValues: currentRow ?? {
            name: '',
            slug: '',
            description: '',
        },
    })

    const onSubmit = (data: WorkspaceForm) => {
        if (isUpdate) {
            updateWorkspace.mutate(
                {
                    id: currentRow.id,
                    organizationId: organization.data.id,
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
            createWorkspace.mutate(
                {
                    organizationId: organization.data.id,
                    ...data,
                },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        form.reset()
                    },
                }
            )
        }
    }

    const isLoading = createWorkspace.isPending || updateWorkspace.isPending

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
                        {isUpdate ? 'Update' : 'Create'} Workspace
                    </DialogTitle>
                    <DialogDescription>
                        {isUpdate
                            ? 'Update the workspace by providing necessary info.'
                            : 'Add a new workspace by providing necessary info.'}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id='workspace-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Workspace Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='My Workspace' />
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
                                            placeholder='my-workspace'
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    .toLowerCase()
                                                    .replace(/\s+/g, '-')
                                                field.onChange(value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This will be used in the URL
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
                                            placeholder='A brief description of this workspace'
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
                    <Button form='workspace-form' type='submit' disabled={isLoading}>
                        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        {isUpdate ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}