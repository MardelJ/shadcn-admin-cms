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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { Loader2 } from 'lucide-react'
import { type Organization } from '../data/schema'
import { useCreateOrganization, useUpdateOrganization } from '../data/hooks/use-organization'

type OrganizationMutateDialogProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: Organization
}

const formSchema = z.object({
    name: z.string().min(1, 'Organization name is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(
            /^[a-z0-9-]+$/,
            'Slug must contain only lowercase letters, numbers, and hyphens'
        ),
})

type OrganizationForm = z.infer<typeof formSchema>

export function OrganizationMutateDialog({
    isOpen,
    onOpenChange,
    currentRow,
}: OrganizationMutateDialogProps) {
    const isUpdate = !!currentRow
    const createOrganization = useCreateOrganization()
    const updateOrganization = useUpdateOrganization()

    const form = useForm<OrganizationForm>({
        resolver: zodResolver(formSchema),
        defaultValues: currentRow ?? {
            name: '',
            slug: '',
        },
    })

    const onSubmit = (data: OrganizationForm) => {
        if (isUpdate) {
            updateOrganization.mutate(
                { id: currentRow.id, ...data },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        form.reset()
                    },
                }
            )
        } else {
            createOrganization.mutate(data, {
                onSuccess: () => {
                    onOpenChange(false)
                    form.reset()
                },
            })
        }
    }

    const isLoading = createOrganization.isPending || updateOrganization.isPending

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
                        {isUpdate ? 'Update' : 'Create'} Organization
                    </DialogTitle>
                    <DialogDescription>
                        {isUpdate
                            ? 'Update the organization by providing necessary info.'
                            : 'Add a new organization by providing necessary info.'}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        id='organization-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4'
                    >
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='Enter organization name' />
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
                                            placeholder='organization-slug'
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    .toLowerCase()
                                                    .replace(/\s+/g, '-')
                                                field.onChange(value)
                                            }}
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
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        form='organization-form'
                        type='submit'
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        {isUpdate ? 'Update' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}