"use server"

import { createClient } from "@/src/utils/supabase/server"
import { revalidatePath } from "next/cache"
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

export async function singOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    return redirect("/")
}