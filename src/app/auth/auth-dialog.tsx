"use client"

import {Button, Modal, notification} from "antd";
import {useState} from "react";
import {LoginButton} from "@telegram-auth/react";
import {signInWithTelegramAction} from "@/app/auth/actions";
import {useClient} from "@/utils/supabase/client";
import {useRouter} from "next/navigation";

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

interface AuthDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function AuthDialog({open, onClose}: AuthDialogProps) {
    const [loading, setLoading] = useState(false);
    const [api, contextHolder] = notification.useNotification();
    const router = useRouter();
    const supabase = useClient();

    const handleTelegramAuth = async (user: TelegramUser) => {
        setLoading(true);
        try {
            const actionResult = await signInWithTelegramAction(user);
            if (actionResult.success && actionResult.session) {
                await supabase.auth.setSession({
                    access_token: actionResult.session.access_token,
                    refresh_token: actionResult.session.refresh_token
                });
                onClose();
                router.refresh();
            } else {
                api.error({
                    message: "Ошибка при входе",
                    description: actionResult.error || "Ошибка авторизации через Telegram"
                });
            }
        } catch (error) {
            api.error({
                message: "Ошибка при входе", 
                description: "Произошла ошибка при авторизации"
            });
        }
        setLoading(false);
    };

    const handleTestAuth = async () => {
        setLoading(true);
        try {
            const {error} = await supabase.auth.signInWithPassword({
                email: "not@use.please",
                password: "test123"
            });

            if (!error) {
                onClose();
                router.refresh();
            } else {
                api.error({
                    message: "Ошибка при входе", 
                    description: error.message || "Ошибка тестовой авторизации"
                });
            }
        } catch (error) {
            api.error({
                message: "Ошибка при входе", 
                description: "Произошла ошибка при тестовой авторизации"
            });
        }
        setLoading(false);
    };

    return (
        <>
            {contextHolder}
            <Modal
                title="Авторизация"
                open={open}
                onCancel={onClose}
                footer={null}
                confirmLoading={loading}
                destroyOnHidden
            >
                <div className="flex flex-col items-center gap-4 py-4">
                    <LoginButton
                        lang={"ru"}
                        botUsername="dbackuper_bot"
                        onAuthCallback={handleTelegramAuth}
                    />
                    <Button type="dashed" onClick={handleTestAuth}>
                        Test Auth
                    </Button>
                </div>
            </Modal>
        </>
    );
}