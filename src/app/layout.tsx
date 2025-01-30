
import './global.css'
import styles from './styles.module.css'
import Header from './components/header'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU';
import '@ant-design/v5-patch-for-react-19';

export default function Layout({ children }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body>
                <AntdRegistry>
                    <ConfigProvider locale={ruRU}>
                        <div>
                            <div className={styles.header}>
                                <Header />
                            </div>

                            <div className={styles.content}>
                                {children}
                            </div>
                        </div>
                    </ConfigProvider>
                </AntdRegistry>

            </body>
        </html>
    )
}

