import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, ArrowUpAZ, ArrowDownAZ, Building2 } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getRouteApi } from "@tanstack/react-router";
import { type ChangeEvent, useState } from 'react'
import { Separator } from "@/components/ui/separator";
import { useOrganizations } from "./data/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { OrganizationsPrimaryButtons } from "./components/organizations-primary-buttons";
import { OrganizationsProvider } from "./components/organizations-provider";
import { OrganizationsDialogs } from "./components/organizations-dialogs";
import { Skeleton } from "@/components/ui/skeleton";


const route = getRouteApi('/_authenticated/organizations/')

export function Organizations() {

    const { organizations, isLoading } = useOrganizations()
    const {
        filter = '',
        name = '',
        sort: initSort = 'asc',
    } = route.useSearch()

    const navigate = route.useNavigate()

    const [sort, setSort] = useState(initSort)

    const [searchTerm, setSearchTerm] = useState(filter)

    const filteredOrganizations = (organizations || []).sort((a, b) =>
        sort === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
    ).filter((org) => org.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        navigate({
            search: (prev) => ({
                ...prev,
                filter: e.target.value || undefined,
            }),
        })
    }

    const handleSortChange = (sort: 'asc' | 'desc') => {
        setSort(sort)
        navigate({
            search: (prev) => ({
                ...prev,
                sort,
            }),
        })
    }

    if (isLoading) {
        return (
            <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3'>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <li key={i} className='rounded-lg border p-4 hover:shadow-md'>
                        <Skeleton className='mb-2 h-4 w-1/2' />
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <OrganizationsProvider>
            {/* ===== Top Heading ===== */}
            <Header>
                <Search />
                <div className='ms-auto flex items-center gap-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            {/* ===== Content ===== */}
            <Main fixed>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Organizations</h2>
                        <p className='text-muted-foreground'>
                            Here&apos;s a list of your organizations
                        </p>
                    </div>
                    <OrganizationsPrimaryButtons />
                </div>

                <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
                    <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
                        <Input
                            placeholder='Filter apps...'
                            className='h-9 w-40 lg:w-[250px]'
                            value={searchTerm}
                            onChange={handleSearch}
                        />

                    </div>

                    <Select value={sort} onValueChange={handleSortChange}>
                        <SelectTrigger className='w-16'>
                            <SelectValue>
                                <SlidersHorizontal size={18} />
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent align='end'>
                            <SelectItem value='asc'>
                                <div className='flex items-center gap-4'>
                                    <ArrowUpAZ size={16} />
                                    <span>Ascending</span>
                                </div>
                            </SelectItem>
                            <SelectItem value='desc'>
                                <div className='flex items-center gap-4'>
                                    <ArrowDownAZ size={16} />
                                    <span>Descending</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Separator className='shadow-sm' />
                <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3'>
                    {filteredOrganizations.map((app) => (
                        <li
                            key={app.name}
                            className='rounded-lg border p-4 hover:shadow-md'
                        >
                            <div className='mb-8 flex items-center justify-between'>
                                <div
                                    className={`bg-muted flex size-10 items-center justify-center rounded-lg p-2`}
                                >
                                    <Building2 size={16} />
                                </div>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className={``}
                                >
                                    add
                                </Button>
                            </div>
                            <div>
                                <h2 className='mb-1 font-semibold'>{app.name}</h2>
                                {/* <p className='line-clamp-2 text-gray-500'>{app.desc}</p> */}
                            </div>
                        </li>
                    ))}

                </ul>


            </Main>
            <OrganizationsDialogs />
        </OrganizationsProvider>
    )
}