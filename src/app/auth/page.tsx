"use client"

import {Card, Flex, notification, Button} from "antd";
import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {LoginButton} from "@telegram-auth/react";
import {signInWithTelegramAction} from "./actions";
import type {FormInput} from "./models";

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

    const handleTelegramAuth = async (user: TelegramUser) => {
        setLoading(true)
        try {
            const actionResult = await signInWithTelegramAction(user)
            if (actionResult.success) {
                router.replace("/")
            } else {
                api.error({message: "Ошибка при входе", description: actionResult.error || "Ошибка авторизации через Telegram"})
            }
        } catch (error) {
            api.error({message: "Ошибка при входе", description: "Произошла ошибка при авторизации"})
        }
        setLoading(false)
    };

    const handleTestAuth = async () => {
        setLoading(true)
        try {
            const { signInAction } = await import("./actions");
            const actionResult = await signInAction({
                email: "not@use.please",
                password: "test123"
            } as FormInput);
            if (actionResult.success) {
                router.replace("/")
            } else {
                api.error({message: "Ошибка при входе", description: actionResult.error || "Ошибка тестовой авторизации"})
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