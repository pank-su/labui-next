"use client"

import styles from './styles.module.css'
import Header from '../components/header'
import { theme } from 'antd'

import '@ant-design/v5-patch-for-react-19';


const { useToken } = theme;


export default function Layout({ children }: {
    children: React.ReactNode
}) {

    const { token } = useToken();


    return (

        <div>
            <div className={styles.header} style={{
                backgroundColor: token.colorBgBase
            }}>
                <Header />
            </div>

            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}

