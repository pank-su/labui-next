
import './global.css'
import styles from './styles.module.css'
import Header from './header'
import { AntdRegistry } from '@ant-design/nextjs-registry'

export default function Layout({ children }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body>
                <AntdRegistry>
                    <div>
                        <div className={styles.header}>
                            <Header/>
                        </div>

                        <div className={styles.content}>
                            {children}
                        </div>
                    </div>
                </AntdRegistry>

            </body>
        </html>
    )
}

