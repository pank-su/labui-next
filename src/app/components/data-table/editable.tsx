"use-client"

import {CheckOutlined} from "@ant-design/icons";
import {User} from "@supabase/supabase-js";
import {Button, Space} from "antd";
import TextArea from "antd/es/input/TextArea";
import {useState} from "react";
import ExpandableText from "../expand-text";

export function EditText({cellValue, onCancel, onSuccess}: {
    cellValue: string | null,
    onCancel: () => void,
    onSuccess: (value: string | null) => void
}) {

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
                autoSize/>
            <Button
                onClick={() => {
                    onSuccess(value)
                }}
                size="small"
            >
                <CheckOutlined/>
            </Button>
        </Space.Compact>
    );
}

export function EditableCell({
    cellValue, 
    onSave, 
    user, 
    rowId, 
    fieldName, 
    onStartEditing, 
    onStopEditing, 
    isFieldEditing
}: {
    cellValue: string | null,
    onSave: (value: string | null) => void,
    user?: User | null,
    rowId?: number,
    fieldName?: string,
    onStartEditing?: (rowId: number, fieldName: string) => void,
    onStopEditing?: (rowId: number, fieldName: string) => void,
    isFieldEditing?: (rowId: number, fieldName: string) => boolean
}) {
    const [isEdit, setIsEdit] = useState(false);
    
    // Используем контролируемое состояние если переданы все необходимые props
    const useControlledState = rowId !== undefined && fieldName && onStartEditing && onStopEditing && isFieldEditing;
    const isEditing = useControlledState ? isFieldEditing(rowId, fieldName) : isEdit;
    
    const handleStartEdit = () => {
        if (useControlledState && rowId !== undefined && fieldName) {
            onStartEditing(rowId, fieldName);
        } else {
            setIsEdit(true);
        }
    };
    
    const handleStopEdit = () => {
        if (useControlledState && rowId !== undefined && fieldName) {
            onStopEditing(rowId, fieldName);
        } else {
            setIsEdit(false);
        }
    };
    
    return isEditing ? (
        <EditText
            cellValue={cellValue}
            onCancel={handleStopEdit}
            onSuccess={(value) => {
                onSave(value);
                handleStopEdit(); // закрываем редактор после успешного обновления
            }}
        />
    ) : (
        <ExpandableText onDoubleClick={(e) => {
            if (user) {
                handleStartEdit();
            }
            e.preventDefault();
        }}>
            {cellValue}
        </ExpandableText>
    );
}