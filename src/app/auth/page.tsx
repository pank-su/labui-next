"use client"

import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Form, Input, notification } from "antd";
import { useEffect, useState } from "react";
import { signInAction } from "./actions";
import { useRouter } from "next/navigation";


function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [api, contextHolder] = notification.useNotification();
    const router = useRouter()


    const onFinish = async (formData: FormInput) => {
        setLoading(true)
        const actionResult = await signInAction(formData)
        if (actionResult.success) {
            router.replace("/")
        } else {
            api.error({ message: "Ошибка при входе", description: "Неверный логин или пароль" })
        }
        setLoading(false)
    };

    const [isValid, setIsValid] = useState(false)
    const [form] = Form.useForm()
    const values = Form.useWatch([], form);

    useEffect(() => {
        form.validateFields({ validateOnly: true }).then(() => setIsValid(true)).catch(() => setIsValid(false))
    }, [form, values])

    return (
        <>
        {contextHolder}
            <Card title="Авторизация" className="shadow">
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="horizontal">
                    <Form.Item name="email" rules={
                        [
                            {
                                type: 'email',
                                message: 'Введите корректную почту!',
                            },
                            {
                                required: true,
                                message: 'Введите почту!',
                            }
                        ]
                    }>
                        <Input prefix={<MailOutlined />} placeholder="Почта" />
                    </Form.Item>
                    <Form.Item name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Пожалуйста введите свой пароль!',
                            },
                            {
                                min: 6,
                                message: "Пароль должен быть больше 6 символов"
                            }
                        ]}
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
                    </Form.Item>
                    <Form.Item >
                        <Button block type="primary" htmlType="submit" disabled={!isValid} loading={loading}>
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </>)
}

export default function LoginPage() {
    return (
        <Flex className="h-screen" justify="center" align="center">
            <LoginForm />
        </Flex>
    )
}