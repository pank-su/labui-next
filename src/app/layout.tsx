"use client"

import './global.css'
import {AntdRegistry} from '@ant-design/nextjs-registry'
import {ConfigProvider} from 'antd'
import ruRU from 'antd/locale/ru_RU';
import '@ant-design/v5-patch-for-react-19';
import {ReactQueryClientProvider} from './components/query-provider';
import TelegramMiniAppAuth from './components/telegram-mini-app-auth';


export default function Layout({children}: {
    children: React.ReactNode
}) {

    return (
        <html lang="ru">
        <head>

        </head>
        <body>
        <ReactQueryClientProvider>
            <AntdRegistry>
                <ConfigProvider locale={ruRU}>
                    {children}
                    <TelegramMiniAppAuth />
                </ConfigProvider>
            </AntdRegistry>
        </ReactQueryClientProvider>
        </body>
        </html>
    )
}

