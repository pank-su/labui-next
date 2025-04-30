import { Button, Input, Modal, Select, Space } from "antd";
import { GenomRow, Topology } from "../../(general)/models";
import { useEffect, useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { useInsertMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { useClient } from "@/utils/supabase/client";

interface TopologyCellProps {
    genomRow: GenomRow;
    field: 'order' | 'family' | 'genus' | 'kind';
    value: string | null;
    options: { id: number, name: string | null }[];
    isDisabled: boolean;
    isEditing: boolean;
    isLoading: boolean;
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
    isLoading,
    onChange,
    showActions = false,
    onSave,
    onCancel
}) => {
    const [isAddNewModalVisible, setIsAddNewModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [search, setSearch] = useState("")

    const supabase = useClient()

    const { mutateAsync: insertItem, isPending } = useInsertMutation(
        supabase.from(field),
        ["id"],
        "id"
    );

    const handleAddNewItem = async () => {
        if (!newItemName.trim()) return;

        try {
            let insertData: any = { name: newItemName };

            // Добавляем ID родительского элемента, если необходимо
            switch (field) {
                case 'family':
                    if (genomRow.order?.id) {
                        insertData.order_id = genomRow.order.id;
                    }
                    break;

                case 'genus':
                    if (genomRow.family?.id) {
                        insertData.family_id = genomRow.family.id;
                    }
                    break;

                case 'kind':
                    if (genomRow.genus?.id) {
                        insertData.genus_id = genomRow.genus.id;
                    }
                    break;
            }

            // Выполняем вставку
            const result = await insertItem([insertData]);

            if (result && result.length > 0) {


                // Закрываем модальное окно
                setIsAddNewModalVisible(false);
                setNewItemName("");
            }
        } catch (error) {
            console.error('Ошибка при добавлении элемента:', error);
        }
    }



    // Получение всех полей для редактирования
    const startEditing = () => {
        onEdit(genomRow)

    };

    if (isEditing) {
        return (
            <Space.Compact size={"small"} className="w-full">
                <Select
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            onCancel?.()
                        }
                    }}
                    className="w-full"
                    value={genomRow[field]?.id}
                    searchValue={search}
                    onSearch={setSearch}
                    loading={isLoading}
                    
                    onChange={(newId, option) => {
                        
                        if (!Array.isArray(option) && option != null && option.value === "add-new") {
                            setNewItemName(search)
                            setIsAddNewModalVisible(true);
                            return;
                        }
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
                    placement={"topLeft"}
                    showSearch
                    filterOption={(input, option) =>

                        option?.value == "add-new" || (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={[
                        ...options.map(item => ({
                            value: item.id,
                            label: item.name
                        })),
                        { value: "add-new", label: `＋ Добавить` }
                    ]
                    }
                />

                {showActions && (
                    <Button
                        onClick={onSave}
                        icon={<CheckOutlined />}
                    />


                )


                }
                <Modal
                    title={`Добавить новый ${field}`}
                    open={isAddNewModalVisible}
                    onOk={handleAddNewItem}
                    onCancel={() => {
                        setIsAddNewModalVisible(false);
                        setNewItemName("");
                    }}
                    okText="Добавить"
                    cancelText="Отмена"
                    confirmLoading={isPending}
                >
                    <div className="mb-2">
                        Введите название для нового элемента{field === 'family' ? ` в отряде ${genomRow.order?.name || ''}` :
                            field === 'genus' ? ` в семействе ${genomRow.family?.name || ''}` :
                                field === 'kind' ? ` в роде ${genomRow.genus?.name || ''}` : ''}
                    </div>
                    <Input
                        placeholder="Название"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onPressEnter={handleAddNewItem}
                        autoFocus
                    />
                </Modal>
            </Space.Compact>
        );
    }

    return (
        <div
            className="cursor-pointer w-full"
            onDoubleClick={startEditing}
        >
            {value || ' '}
        </div>
    );
};