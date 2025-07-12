"use client"

import { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useClient } from "@/utils/supabase/client";

interface CreateCollectorDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (collector: { id: number; first_name?: string | null; last_name?: string | null; second_name?: string | null }) => void;
}

export default function CreateCollectorDialog({
    open,
    onClose,
    onSuccess
}: CreateCollectorDialogProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const supabase = useClient();
    const queryClient = useQueryClient();

    const handleSubmit = async (values: { lastName: string; firstName?: string; secondName?: string }) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("collector")
                .insert({
                    last_name: values.lastName.trim(),
                    first_name: values.firstName?.trim() || null,
                    second_name: values.secondName?.trim() || null
                })
                .select()
                .single();

            if (error) throw error;

            // Обновляем кеш
            queryClient.invalidateQueries({ queryKey: ["collectors-all"] });
            queryClient.invalidateQueries({ queryKey: ["collectors"] });

            message.success("Коллектор создан");
            onSuccess(data);
            form.resetFields();
            onClose();
        } catch (error) {
            console.error("Ошибка создания коллектора:", error);
            message.error("Ошибка создания коллектора");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Создать нового коллектора"
            open={open}
            onOk={form.submit}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="Создать"
            cancelText="Отмена"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <Form.Item
                    label="Фамилия"
                    name="lastName"
                    rules={[
                        { required: true, message: "Введите фамилию" },
                        { max: 100, message: "Максимум 100 символов" }
                    ]}
                >
                    <Input placeholder="Введите фамилию" />
                </Form.Item>

                <Form.Item
                    label="Имя"
                    name="firstName"
                    rules={[{ max: 100, message: "Максимум 100 символов" }]}
                >
                    <Input placeholder="Введите имя (необязательно)" />
                </Form.Item>

                <Form.Item
                    label="Отчество"
                    name="secondName"
                    rules={[{ max: 100, message: "Максимум 100 символов" }]}
                >
                    <Input placeholder="Введите отчество (необязательно)" />
                </Form.Item>
            </Form>
        </Modal>
    );
}