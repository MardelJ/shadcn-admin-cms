import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { getMe } from '@/features/users/data/hooks/use-users'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location, context }) => {
    const { accessToken, user, setUser } = useAuthStore.getState().auth

    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    if (!user) {
      try {
        const data = await context.queryClient.ensureQueryData({
          queryKey: ['me'],
          queryFn: getMe,
        })
        setUser(data.data)
      } catch (error) {
        useAuthStore.getState().auth.reset()
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }
  },
  component: AuthenticatedLayout,
})
