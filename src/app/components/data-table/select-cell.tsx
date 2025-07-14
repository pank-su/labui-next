import {Button, Select, Space} from "antd";
import {useEffect, useState} from "react";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import Expandable from "../expandable";

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
    isEditable?: boolean;
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
                                                          isEditable = false,
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
                    className="w-full min-w-0"
                    style={{ width: '100%' }}
                    value={currentValue}
                    onChange={setCurrentValue}
                    options={options}
                    placeholder={placeholder}
                    allowClear
                    dropdownStyle={{ zIndex: 1050 }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            handleCancel();
                        } else if (e.key === 'Enter') {
                            handleSave();
                        }
                    }}
                />

                <Button
                    onClick={handleCancel}
                    icon={<CloseOutlined/>}
                    danger
                />
                <Button
                    onClick={handleSave}
                    icon={<CheckOutlined/>}
                />
            </Space.Compact>
        );
    }

    return (
        <Expandable onDoubleClick={() => isEditable && setEdit(true)} isEditable={isEditable}>
            <div className="min-h-[20px] w-full">
                {displayValue}
            </div>
        </Expandable>
    );
}