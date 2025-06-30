"use server"

import {createClient} from "@/utils/supabase/server"
import {revalidatePath} from "next/cache"
import {redirect} from "next/navigation"


export async function signInAction(formData: FormInput): Promise<SignInResult> {
    const supabase = await createClient()
    const {error} = await supabase.auth.signInWithPassword({email: formData.email, password: formData.password})

    if (error) {
        return {
            success: false,
            error: error.message
        }
    }

    // Добавляем revalidatePath для обновления данных
    revalidatePath("/", "layout")

    // Выполняем редирект на сервере
    redirect("/")

    return {
        success: true,
        error: null
    };

}

export async function signInWithTelegramAction(user: any): Promise<SignInResult> {
    console.log(user);
    try {
        const response = await fetch('http://0.0.0.0:8080/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            return {
                success: false,
                error: 'Ошибка авторизации через Telegram'
            };
        }

        const data = await response.json();
        console.log(data);

        // Импортируем сессию из ответа
        const supabase = await createClient()
        const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
        })

        if (sessionError) {
            return {
                success: false,
                error: sessionError.message
            }
        }

        revalidatePath("/", "layout");
        redirect("/");
    } catch (error) {
        console.log(error);
        // Если это ошибка редиректа Next.js, пробрасываем её дальше
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        return {
            success: false,
            error: 'Ошибка подключения к серверу'
        };
    }
}

export async function singOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")

    return redirect("/")
}