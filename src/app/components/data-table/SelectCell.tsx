import { Button, Select, Space } from "antd";
import { useState, useEffect } from "react";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

interface SelectOption {
    value?: number | null;
    label: string;
}

interface SelectCellProps {
    value?: number | null;
    displayValue: string;
    options: SelectOption[];
    rowId: number;
    isEditing: boolean;
    onSave: (rowId: number, value: number | null) => Promise<void>;
    onCancel: () => void;
    placeholder?: string;
}

export const SelectCell: React.FC<SelectCellProps> = ({
    value = null,
    displayValue,
    options,
    rowId,
    isEditing,
    onSave,
    onCancel,
    placeholder = "Выбрать...",
}) => {
    const [edit, setEdit] = useState(false);
    const [currentValue, setCurrentValue] = useState<number | null>(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleSave = async () => {
        await onSave(rowId, currentValue);
        setEdit(false);
    };

    const handleCancel = () => {
        setCurrentValue(value);
        setEdit(false);
        onCancel();
    };

    if (isEditing && edit) {
        return (
            <Space.Compact size="small" className="w-full">
                <Select
                    className="w-full"
                    value={currentValue}
                    onChange={setCurrentValue}
                    options={options}
                    placeholder={placeholder}
                    allowClear
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            handleCancel();
                        } else if (e.key === 'Enter') {
                            handleSave();
                        }
                    }}
                />

                <Button
                    onClick={handleSave}
                    icon={<CheckOutlined />}
                    type="primary"
                />
            </Space.Compact>
        );
    }

    return (
        <div
            className="cursor-pointer w-full"
            onDoubleClick={() => setEdit(true)}
        >
            {displayValue}
        </div>
    );
}