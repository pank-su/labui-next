import { Button, ColorPicker, Space } from "antd";
import { useEffect, useState } from "react";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import Expandable from "../expandable";

interface ColorPickerCellProps {
    value: string;
    rowId: number;
    isEditing: boolean;
    onSave: (rowId: number, value: string) => Promise<void>;
    onCancel: () => void;
    isEditable?: boolean;
}

export const ColorPickerCell: React.FC<ColorPickerCellProps> = ({
    value,
    rowId,
    isEditing,
    onSave,
    onCancel,
    isEditable = false,
}) => {
    const [edit, setEdit] = useState(false);
    const [currentValue, setCurrentValue] = useState<string>(value);

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
                <ColorPicker
                    value={currentValue}
                    onChange={(color) => setCurrentValue(color.toHexString())}
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
                <div className="flex items-center gap-2">
                    <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: value }}
                    />
                    <span>{value}</span>
                </div>
            </div>
        </Expandable>
    );
};