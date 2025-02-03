"use client"

import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function AuthBtn(){
    const router = useRouter()

    return <Button onClick={() => router.push('/auth')}>Войти</Button>
}

