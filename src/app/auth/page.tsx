"use client"

import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { signInAction } from "./actions";


function LoginForm() {
    const onFinish = async (formData: FormData) => {
        await signInAction(formData)
    };

    const [isValid, setIsValid] = useState(false)
    const [form] = Form.useForm()
    const values = Form.useWatch([], form);

    useEffect(() => {
        form.validateFields().then(() => setIsValid(true)).catch(() => setIsValid(false))
    }, [form, values])

    return (
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
                    ]}
                    hasFeedback
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
                </Form.Item>
                <Form.Item >
                    <Button block type="primary" htmlType="submit" disabled={!isValid}>
                        Войти
                    </Button>
                </Form.Item>
            </Form>
        </Card>)
}

export default function LoginPage() {
    return (
        <Flex className="h-screen" justify="center" align="center">
            <LoginForm />
        </Flex>
    )
}