"use client"

import {Button, Card, Flex, notification} from "antd";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {LoginButton} from "@telegram-auth/react";
import {signInWithTelegramAction} from "./actions";
import {useClient} from "@/utils/supabase/client";

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [api, contextHolder] = notification.useNotification();
    const router = useRouter()
    const supabase = useClient()

    const handleTelegramAuth = async (user: TelegramUser) => {
        setLoading(true)
        try {
            const actionResult = await signInWithTelegramAction(user)
            if (actionResult.success && actionResult.session) {
                // Устанавливаем сессию на клиенте
                await supabase.auth.setSession({
                    access_token: actionResult.session.access_token,
                    refresh_token: actionResult.session.refresh_token
                });
                router.replace("/")
            } else {
                api.error({
                    message: "Ошибка при входе",
                    description: actionResult.error || "Ошибка авторизации через Telegram"
                })
            }
        } catch (error) {
            api.error({message: "Ошибка при входе", description: "Произошла ошибка при авторизации"})
        }
        setLoading(false)
    };

    const handleTestAuth = async () => {
        setLoading(true)
        try {
            // Используем клиентский вход вместо server action
            const {error} = await supabase.auth.signInWithPassword({
                email: "not@use.please",
                password: "test123"
            });

            if (!error) {
                router.replace("/")
            } else {
                api.error({message: "Ошибка при входе", description: error.message || "Ошибка тестовой авторизации"})
            }
        } catch (error) {
            api.error({message: "Ошибка при входе", description: "Произошла ошибка при тестовой авторизации"})
        }
        setLoading(false)
    };

    return (

        <>
            {contextHolder}
            <Card title="Авторизация" className="shadow" loading={loading}>
                <div className="flex flex-col items-center gap-4">
                    <LoginButton
                        lang={"ru"}
                        botUsername="dbackuper_bot"
                        onAuthCallback={handleTelegramAuth}
                    />
                    <Button type="dashed" onClick={handleTestAuth}>
                        Test Auth
                    </Button>
                </div>
            </Card>
        </>)
}

export default function LoginPage() {
    return (
        <Flex className="h-screen" justify="center" align="center">
            <LoginForm/>
        </Flex>
    )
}