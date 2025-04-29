"use client"

import styles from './styles.module.css'
import Header from '../components/header'
import { theme } from 'antd'

import '@ant-design/v5-patch-for-react-19';
import {Suspense} from "react";


const { useToken } = theme;


export default function Layout({ children }: {
    children: React.ReactNode
}) {

    const { token } = useToken();


    return (

        <div className="flex flex-col h-screen">
            <div className={styles.header} style={{
                backgroundColor: token.colorBgBase
            }}>
                <Header />
            </div>

            <div className={styles.content}>
                <Suspense>
                {children}
                </Suspense>
            </div>
        </div>
    )
}

