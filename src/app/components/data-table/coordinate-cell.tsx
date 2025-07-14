import {Button, Input, Space} from "antd";
import {CoordinateRow} from "../../(general)/models";
import {useState, useEffect, useRef} from "react";
import {CheckOutlined, EnvironmentOutlined} from "@ant-design/icons";
import Expandable from "../expandable";

interface CoordinateCellProps {
    coordinateRow: CoordinateRow;
    field: 'latitude' | 'longitude';
    value: number | null;
    isEditing: boolean;
    onEdit: (row: CoordinateRow) => void;
    onChange: (field: 'latitude' | 'longitude', value: number | null) => void;
    showActions?: boolean;
    onSave?: () => void;
    onCancel?: () => void;
    onMapSelect?: (rowId: number) => void;
}

export const CoordinateCell: React.FC<CoordinateCellProps> = ({
    coordinateRow,
    field,
    value,
    isEditing,
    onEdit,
    onChange,
    showActions = false,
    onSave,
    onCancel,
    onMapSelect
}) => {
    const [tempValue, setTempValue] = useState<string>(value?.toString() || "");
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Синхронизируем tempValue с внешним value только когда не в режиме редактирования
    useEffect(() => {
        if (!isEditing) {
            setTempValue(value?.toString() || "");
        }
    }, [value, isEditing]);

    // Очищаем таймаут при размонтировании
    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);

    const formatValue = (val: number | null): string => {
        if (val === null || val === undefined) return "";
        return val.toFixed(6);
    };

    const isValidInput = (inputValue: string): boolean => {
        // Разрешаем пустое значение
        if (inputValue.trim() === "") {
            return true;
        }
        
        // Разрешаем частичный ввод: знак минус, точка, цифры с точкой
        const partialPattern = /^-?(\d+\.?\d*|\.\d*)$/;
        return partialPattern.test(inputValue);
    };

    const isValidCoordinate = (inputValue: string, coordinateType: 'latitude' | 'longitude'): boolean => {
        if (inputValue.trim() === "") {
            return true;
        }
        
        const numValue = parseFloat(inputValue);
        
        // Если число не парсится, это не валидная координата
        if (isNaN(numValue)) {
            return false;
        }
        
        if (coordinateType === 'latitude') {
            return numValue >= -90 && numValue <= 90;
        } else {
            return numValue >= -180 && numValue <= 180;
        }
    };

    const handleInputChange = (inputValue: string) => {
        // Разрешаем любой валидный ввод
        if (!isValidInput(inputValue)) {
            return; // Блокируем только совсем невалидные символы
        }
        
        setTempValue(inputValue);
        
        // Очищаем предыдущий таймаут
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        // Устанавливаем новый таймаут для обновления карты
        debounceTimeout.current = setTimeout(() => {
            if (inputValue.trim() === "") {
                onChange(field, null);
            } else {
                const numValue = parseFloat(inputValue);
                if (!isNaN(numValue) && isValidCoordinate(inputValue, field)) {
                    onChange(field, numValue);
                }
            }
        }, 500); // Задержка 500ms для обновления карты
    };

    const getPlaceholder = (field: 'latitude' | 'longitude') => {
        return field === 'latitude' ? 'Широта (-90 до 90)' : 'Долгота (-180 до 180)';
    };

    const startEditing = () => {
        onEdit(coordinateRow);
        setTempValue(value?.toString() || "");
    };

    const handleSave = () => {
        // Очищаем таймаут debounce при сохранении
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        // Перед сохранением обновляем координату через onChange
        if (tempValue.trim() === "") {
            onChange(field, null);
        } else {
            const numValue = parseFloat(tempValue);
            if (!isNaN(numValue) && isValidCoordinate(tempValue, field)) {
                onChange(field, numValue);
            }
        }
        
        // После обновления состояния вызываем onSave
        // Добавляем небольшую задержку, чтобы состояние успело обновиться
        setTimeout(() => {
            onSave?.();
        }, 0);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <Space.Compact size="small" className="flex-1">
                    <Input
                        value={tempValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder={getPlaceholder(field)}
                        size="small"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                onCancel?.();
                            } else if (e.key === 'Enter') {
                                handleSave();
                            }
                        }}
                        style={{
                            borderColor: tempValue && !isValidInput(tempValue) ? '#ff4d4f' : undefined
                        }}
                    />
                    
                    {showActions && (
                        <Button
                            onClick={handleSave}
                            icon={<CheckOutlined/>}
                            size="small"
                            disabled={!!tempValue && (!isValidCoordinate(tempValue, field) || tempValue.endsWith('.') || tempValue === '.' || tempValue === '-' || tempValue === '-.')}
                        />
                    )}
                </Space.Compact>
                
                {field === 'latitude' && onMapSelect && (
                    <Button
                        type="text"
                        size="small"
                        icon={<EnvironmentOutlined/>}
                        onClick={() => onMapSelect(coordinateRow.rowId!)}
                        title="Выбрать на карте"
                    />
                )}
            </div>
        );
    }

    return (
        <Expandable onDoubleClick={startEditing}>
            {formatValue(value) || ' '}
        </Expandable>
    );
};