"use-client"

import { CheckOutlined } from "@ant-design/icons";
import { User } from "@supabase/supabase-js";
import { Space, Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import ExpandableText from "../expand-text";

export function EditText({ cellValue, onCancel, onSuccess }: { cellValue: string | null, onCancel: () => void, onSuccess: (value: string | null) => void }) {

    const [value, setValue] = useState(cellValue)

    // Возможно стоит добавить popconfirm
    return (
        <Space.Compact className="w-full">
            <TextArea
                value={value ?? ""}
                onChange={(e) => setValue(e.target.value)}
                className="w-full"
                size="small"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        onCancel()
                    } else if (e.key === "Enter") {
                        onSuccess(value)
                    }
                }}
             autoSize />
            <Button
                onClick={() => {
                    onSuccess(value)
                }}
                size="small"
            >
                <CheckOutlined />
            </Button>
        </Space.Compact>
    );
}

export function EditableCell({ cellValue, onSave, user }: { cellValue: string | null, onSave: (value: string | null) => void, user?: User | null }) {
    const [isEdit, setIsEdit] = useState(false);
    return isEdit ? (
        <EditText
            cellValue={cellValue}
            onCancel={() => setIsEdit(false)}
            onSuccess={(value) => {
                onSave(value);
                setIsEdit(false); // закрываем редактор после успешного обновления
            }}
        />
    ) : (
        <ExpandableText onDoubleClick={(e) => {
            if (user) {
                setIsEdit(true);
            }
            e.preventDefault();
        }}>
            {cellValue}
        </ExpandableText>
    );
}