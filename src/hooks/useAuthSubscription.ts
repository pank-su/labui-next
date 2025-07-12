"use client"

import {useEffect} from "react";
import {useClient} from "@/utils/supabase/client";
import {useQueryClient} from "@tanstack/react-query";

let subscriptionActive = false;

export function useAuthSubscription() {
    const supabase = useClient();
    const queryClient = useQueryClient();

    useEffect(() => {
        // Предотвращаем множественные подписки
        if (subscriptionActive) return;

        subscriptionActive = true;

        const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event); // Для отладки
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                queryClient.invalidateQueries({queryKey: ["supabase-get-user"]});
            }
        });

        return () => {
            subscriptionActive = false;
            subscription.unsubscribe();
        };
    }, [supabase.auth, queryClient]);
}