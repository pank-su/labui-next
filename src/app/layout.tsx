"use client"

import './global.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU';
import '@ant-design/v5-patch-for-react-19';
import { ReactQueryClientProvider } from './components/query-provider';


const { useToken } = theme;


export default function Layout({ children }: {
    children: React.ReactNode
}) {

    const { token } = useToken();


    return (
        <ReactQueryClientProvider>
            <html lang="ru">
                <head>

                </head>
                <body>
                    <AntdRegistry>
                        <ConfigProvider locale={ruRU}>

                            {children}

                        </ConfigProvider>
                    </AntdRegistry>
                </body>
            </html>
        </ReactQueryClientProvider>
    )
}

