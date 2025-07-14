"use client"

import {useClient} from "@/utils/supabase/client";
import {useQuery} from "@tanstack/react-query";

/**
 * Хук для получения текущего пользователя
 */
export function useUser() {
    const supabase = useClient();
    
    const {data, isLoading} = useQuery({
        queryKey: ["supabase-get-user"],
        gcTime: 5 * 60 * 1000, // 5 минут
        staleTime: 2 * 60 * 1000, // 2 минуты
        queryFn: () => supabase.auth.getUser()
    });

    return {
        user: data?.data.user,
        isLoading
    };
}