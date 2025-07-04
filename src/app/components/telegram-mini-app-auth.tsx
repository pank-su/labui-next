"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { retrieveRawInitData } from '@telegram-apps/sdk';
import { notification } from 'antd';
import { signInWithTelegramAction } from '../auth/actions';

export default function TelegramMiniAppAuth() {
    const router = useRouter();
    const [api, contextHolder] = notification.useNotification();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const handleTelegramMiniAppAuth = async () => {
            try {
                const initDataRaw = retrieveRawInitData();
                
                if (!initDataRaw) {
                    return;
                }

                const actionResult = await signInWithTelegramAction(initDataRaw);
                
                if (!actionResult.success) {
                    api.error({
                        message: "Ошибка авторизации",
                        description: actionResult.error || "Не удалось авторизоваться через Telegram Mini App"
                    });
                }
            } catch (error) {
                // Игнорируем ошибку если приложение открыто не в Telegram
                if (error instanceof Error && error.message.includes('LaunchParamsRetrieveError')) {
                    return;
                }
                console.error('Telegram Mini App auth error:', error);
            }
        };

        handleTelegramMiniAppAuth();
    }, [api, mounted]);

    if (!mounted) return null;

    return <>{contextHolder}</>;
}