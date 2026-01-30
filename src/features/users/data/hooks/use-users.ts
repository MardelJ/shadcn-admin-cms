import { HttpClient } from "@/lib/axios-client";
import { useQuery } from "@tanstack/react-query";

export interface User {
    id: string,
    email: string,
    passwordHash: string,
    fullName: string,
    username: string,
    avatarUrl: string,
    emailVerifiedAt?: Date,
    createdAt: Date,
    updatedAt: Date,
}

interface ApiResponse<T> {
    data: T
    message: string
    statusCode: number
}

export async function getMe(): Promise<ApiResponse<User>> {
    return HttpClient.get<ApiResponse<User>>('/v1/users/me')
}

export function useGetMe() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        refetchOnWindowFocus: false,
        refetchOnMount: true
    })

    return {
        user: data?.data || null,
        isLoading,
        error,
        refetch,
    }

}