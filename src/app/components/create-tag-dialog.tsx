"use client"

import { useState } from "react";
import { Modal, Form, Input, ColorPicker, message } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useClient } from "@/utils/supabase/client";

interface CreateTagDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (tag: { id: number; name: string; description?: string | null; color?: string | null }) => void;
}

export default function CreateTagDialog({
    open,
    onClose,
    onSuccess
}: CreateTagDialogProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const supabase = useClient();
    const queryClient = useQueryClient();

    const handleSubmit = async (values: { name: string; description?: string; color: string }) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("tags")
                .insert({
                    name: values.name.trim(),
                    description: values.description?.trim() || null,
                    color: values.color.toLowerCase()
                })
                .select()
                .single();

            if (error) throw error;

            // Обновляем кеш
            queryClient.invalidateQueries({ queryKey: ["tags-all"] });
            queryClient.invalidateQueries({ queryKey: ["tags"] });

            message.success("Тег создан");
            onSuccess(data);
            form.resetFields();
            onClose();
        } catch (error) {
            console.error("Ошибка создания тега:", error);
            message.error("Ошибка создания тега");
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
            title="Создать новый тег"
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
                initialValues={{ color: "#1677ff" }}
            >
                <Form.Item
                    label="Название"
                    name="name"
                    rules={[
                        { required: true, message: "Введите название тега" },
                        { max: 50, message: "Максимум 50 символов" }
                    ]}
                >
                    <Input placeholder="Введите название тега" />
                </Form.Item>

                <Form.Item
                    label="Описание"
                    name="description"
                    rules={[{ max: 200, message: "Максимум 200 символов" }]}
                >
                    <Input.TextArea 
                        placeholder="Введите описание (необязательно)" 
                        rows={3}
                        showCount
                        maxLength={200}
                    />
                </Form.Item>

                <Form.Item
                    label="Цвет"
                    name="color"
                    rules={[{ required: true, message: "Выберите цвет" }]}
                    getValueFromEvent={(color) => color.toHexString()}
                >
                    <ColorPicker 
                        showText 
                        format="hex"
                        presets={[
                            {
                                label: 'Рекомендуемые',
                                colors: [
                                    '#1677ff',
                                    '#52c41a',
                                    '#faad14',
                                    '#f5222d',
                                    '#722ed1',
                                    '#fa8c16',
                                    '#13c2c2',
                                    '#eb2f96',
                                    '#2f54eb',
                                    '#87d068'
                                ],
                            },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}