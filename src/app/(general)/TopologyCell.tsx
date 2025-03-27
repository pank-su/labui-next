import { Select } from "antd";
import { GenomRow, Topology } from "./models";
import { useClient } from "@/utils/supabase/client";
import { useEffect } from "react";

interface TopologyCellProps {
    genomRow: GenomRow;
    field: 'order' | 'family' | 'genus' | 'kind';
    value: Topology | undefined;
    options: { id: number, name: string | null }[];
    isDisabled: boolean;
    isEditing: boolean;
    onEdit: (row: GenomRow) => void;
    onChange: (field: string, value: Topology | undefined) => void;
    showActions?: boolean;
    onSave?: () => void;
    onCancel?: () => void;
}

export const TopologyCell: React.FC<TopologyCellProps> = ({
    genomRow,
    field,
    value,
    options,
    isDisabled,
    isEditing,
    onEdit,
    onChange,
    showActions = false,
    onSave,
    onCancel
}) => {

    useEffect(() => {
        if (isEditing){
            console.log(genomRow)
            console.log(genomRow[field]?.id)
        }
    }, [genomRow])
    


    // Получение всех полей для редактирования
    const startEditing = () => {
        onEdit(genomRow)
    };

    if (isEditing) {
        return (
            <div className="relative w-full">
                <Select
                    className="w-full"
                    value={genomRow[field]?.id}
                    onChange={(newId) => {
                        const selectedOption = options.find(opt => opt.id === newId);

                        if (selectedOption) {
                            const topology: Topology = {
                                id: selectedOption.id,
                                name: selectedOption.name
                            };
                            onChange(field, topology);
                        }
                    }}
                    disabled={isDisabled}
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={options.map(item => ({
                        value: item.id,
                        label: item.name
                    }))}
                />

                {showActions && (
                    <div className="absolute top-0 right-0 flex space-x-1 mt-1 mr-1">
                        <button
                            className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={onSave}
                        >
                            ✓
                        </button>
                        <button
                            className="px-2 py-0.5 text-xs bg-gray-200 rounded hover:bg-gray-300"
                            onClick={onCancel}
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className="cursor-pointer w-full"
            onDoubleClick={startEditing}
        >
            {value?.name || ''}
        </div>
    );
};