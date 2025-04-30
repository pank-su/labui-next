import { Button, Input, Space, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { formatDate } from "@/utils/formatDate";

interface DateCellProps {
    value: string; // Отформатированная строка даты
    year: number | null;
    month: number | null;
    day: number | null;
    rowId: number;
    isEditing: boolean;
    onSave: (rowId: number, year: number | null, month: number | null, day: number | null) => Promise<void>;
    onCancel: () => void;
    disabled?: boolean;
}

export const DataCell: React.FC<DateCellProps> = ({
    value,
    year,
    month,
    day,
    rowId,
    isEditing,
    onSave,
    onCancel,
    disabled = false,
}) => {
    const [edit, setEdit] = useState(false);
    const [yearValue, setYearValue] = useState<string>(year !== null ? year.toString() : '');
    const [monthValue, setMonthValue] = useState<string>(month !== null ? month.toString() : '');
    const [dayValue, setDayValue] = useState<string>(day !== null ? day.toString() : '');

    // Обновляем локальное состояние при изменении props
    useEffect(() => {
        setYearValue(year !== null ? year.toString() : '');
        setMonthValue(month !== null ? month.toString() : '');
        setDayValue(day !== null ? day.toString() : '');
    }, [year, month, day]);

    const handleSave = async () => {
        const newYear = yearValue ? parseInt(yearValue) : null;
        const newMonth = monthValue ? parseInt(monthValue) : null;
        const newDay = dayValue ? parseInt(dayValue) : null;

        await onSave(rowId, newYear, newMonth, newDay);
        setEdit(false);
    };

    const handleCancel = () => {
        setYearValue(year !== null ? year.toString() : '');
        setMonthValue(month !== null ? month.toString() : '');
        setDayValue(day !== null ? day.toString() : '');
        setEdit(false);
        onCancel();
    };

    // Валидация введенных значений
    const isValidYear = !yearValue || /^\d{4}$/.test(yearValue);
    const isValidMonth = !monthValue || (/^\d{1,2}$/.test(monthValue) && parseInt(monthValue) >= 1 && parseInt(monthValue) <= 12);
    const isValidDay = !dayValue || (/^\d{1,2}$/.test(dayValue) && parseInt(dayValue) >= 1 && parseInt(dayValue) <= 31);

    // Проверка допустимости сохранения
    const canSave = isValidYear && isValidMonth && isValidDay;

    if (isEditing && edit) {
        return (
            <Space direction="vertical" size="small" className="w-full">
                <Space.Compact size="small" className="w-full">
                    <Input
                        placeholder="DD"
                        value={dayValue}
                        onChange={(e) => setDayValue(e.target.value)}
                        style={{ width: '30%' }}
                        maxLength={2}
                        disabled={disabled}
                        status={!isValidDay ? 'error' : ''}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                handleCancel();
                            } else if (e.key === 'Enter' && canSave) {
                                handleSave();
                            }
                        }}
                    />
                    <div className="mx-1 text-gray-500 font-bold">.</div>
                    <Input
                        placeholder="MM"
                        value={monthValue}
                        onChange={(e) => setMonthValue(e.target.value)}
                        style={{ width: '30%' }}
                        maxLength={2}
                        disabled={disabled}
                        status={!isValidMonth ? 'error' : ''}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                handleCancel();
                            } else if (e.key === 'Enter' && canSave) {
                                handleSave();
                            }
                        }}
                    />
                    <div className="mx-1 text-gray-500 font-bold">.</div>
                    <Input
                        placeholder="YYYY"
                        value={yearValue}
                        onChange={(e) => setYearValue(e.target.value)}
                        style={{ width: '40%' }}
                        maxLength={4}
                        disabled={disabled}
                        status={!isValidYear ? 'error' : ''}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                handleCancel();
                            } else if (e.key === 'Enter' && canSave) {
                                handleSave();
                            }
                        }}
                    />


                </Space.Compact>
                <Space.Compact size="small" className="w-full">
                    <Button
                        onClick={handleCancel}
                        icon={<CloseOutlined />}
                        danger
                        style={{ width: '50%' }}
                    />
                    <Button
                        onClick={handleSave}
                        icon={<CheckOutlined />}
                        type="primary"
                        disabled={!canSave}
                        style={{ width: '50%' }}
                    />
                </Space.Compact>
            </Space>
        );
    }

    return (
        <div
            className="cursor-pointer w-full"
            onDoubleClick={() => !disabled && setEdit(true)}
        >
            {value}
        </div>
    );
};