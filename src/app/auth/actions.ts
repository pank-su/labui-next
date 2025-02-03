"use server"

import { createClient } from "@/src/utils/supabase/server"
import { encodedRedirect } from "@/src/utils/utils"
import { redirect } from "next/navigation"





export async function signInAction(formData: FormInput): Promise<SignInResult> {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password })

    if (error) {
        return {
            success: false,
            error: error.message
        }
    }

    return {
        success: true,
        error: null
    };

}