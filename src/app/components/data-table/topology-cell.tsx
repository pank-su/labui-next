import {Button, Input, Modal, Select, Space, Popconfirm, message} from "antd";
import {GenomRow, Topology} from "../../(general)/models";
import {useState} from "react";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import {useInsertMutation} from "@supabase-cache-helpers/postgrest-react-query";
import {useClient} from "@/utils/supabase/client";
import Expandable from "../expandable";

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
    isEditable?: boolean;
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
                                                              onCancel,
                                                              isEditable = false
                                                          }) => {
    const [isAddNewModalVisible, setIsAddNewModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [search, setSearch] = useState("")

    const supabase = useClient()

    const {mutateAsync: insertItem, isPending} = useInsertMutation(
        supabase.from(field),
        ["id"],
        "id"
    );

    const getFieldNameRu = (field: string) => {
        switch (field) {
            case 'order': return 'отряд';
            case 'family': return 'семейство';
            case 'genus': return 'род';
            case 'kind': return 'вид';
            default: return field;
        }
    };

    const handleAddNewItem = async () => {
        const trimmedName = newItemName.trim();
        
        // Проверка на пустое поле
        if (!trimmedName) {
            message.error('Название не может быть пустым');
            return;
        }

        // Проверка на дублирование
        const existingItem = options.find(item => 
            item.name?.toLowerCase() === trimmedName.toLowerCase()
        );
        
        if (existingItem) {
            message.error(`${getFieldNameRu(field).charAt(0).toUpperCase() + getFieldNameRu(field).slice(1)} "${trimmedName}" уже существует`);
            return;
        }

        try {
            let insertData: any = {name: trimmedName};

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
                const newItem = result[0];
                message.success(`${getFieldNameRu(field).charAt(0).toUpperCase() + getFieldNameRu(field).slice(1)} "${trimmedName}" успешно добавлен`);
                
                // Автоматически выбираем добавленный элемент
                const topology = {
                    id: newItem.id,
                    name: trimmedName
                };
                onChange(field, topology);
                
                // Закрываем модальное окно
                setIsAddNewModalVisible(false);
                setNewItemName("");
            }
        } catch (error) {
            console.error('Ошибка при добавлении элемента:', error);
            message.error('Ошибка при добавлении элемента');
        }
    }


    // Получение всех полей для редактирования
    const startEditing = () => {
        if (isEditable) {
            onEdit(genomRow)
        }
    };

    if (isEditing) {
        return (
            <div className="w-full">
                {showActions ? (
                    <Space.Compact size="small" className="w-full">
                        <Select
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    onCancel?.()
                                } else if (e.key === 'Enter') {
                                    onSave?.()
                                }
                            }}
                            className="w-full min-w-0"
                            value={genomRow[field]?.name && genomRow[field]?.name.trim() !== '' ? genomRow[field]?.id : undefined}
                            searchValue={search}
                            onSearch={setSearch}
                            loading={isLoading}
                            placeholder="Выберите или добавьте новый"
                            allowClear

                            onChange={(newId, option) => {
                                // Если поле очищено
                                if (newId === undefined) {
                                    onChange(field, undefined);
                                    return;
                                }

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
                                {value: "add-new", label: `＋ Добавить`}
                            ]
                            }
                        />
                        <Button
                            onClick={onCancel}
                            icon={<CloseOutlined/>}
                            danger
                        />
                        <Button
                            onClick={onSave}
                            icon={<CheckOutlined/>}
                        />
                    </Space.Compact>
                ) : (
                    <Select
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                onCancel?.()
                            } else if (e.key === 'Enter') {
                                onSave?.()
                            }
                        }}
                        className="w-full"
                        size="small"
                        value={genomRow[field]?.name && genomRow[field]?.name.trim() !== '' ? genomRow[field]?.id : undefined}
                        searchValue={search}
                        onSearch={setSearch}
                        loading={isLoading}
                        placeholder="Выберите или добавьте новый"
                        allowClear

                        onChange={(newId, option) => {
                            // Если поле очищено
                            if (newId === undefined) {
                                onChange(field, undefined);
                                return;
                            }

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
                            {value: "add-new", label: `＋ Добавить`}
                        ]
                        }
                    />
                )}
                <Modal
                    title={`Добавить новый ${getFieldNameRu(field)}`}
                    open={isAddNewModalVisible}
                    onCancel={() => {
                        setIsAddNewModalVisible(false);
                        setNewItemName("");
                    }}
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setIsAddNewModalVisible(false);
                            setNewItemName("");
                        }}>
                            Отмена
                        </Button>,
                        <Popconfirm
                            key="confirm"
                            title={`Вы уверены, что хотите добавить ${getFieldNameRu(field)} "${newItemName.trim()}"?`}
                            onConfirm={handleAddNewItem}
                            okText="Да"
                            cancelText="Нет"
                            disabled={!newItemName.trim()}
                        >
                            <Button 
                                type="primary" 
                                loading={isPending}
                                disabled={!newItemName.trim()}
                            >
                                Добавить
                            </Button>
                        </Popconfirm>
                    ]}
                >
                    <div className="mb-2">
                        Введите название для нового {getFieldNameRu(field)}{field === 'family' ? ` в отряде ${genomRow.order?.name || ''}` :
                        field === 'genus' ? ` в семействе ${genomRow.family?.name || ''}` :
                            field === 'kind' ? ` в роде ${genomRow.genus?.name || ''}` : ''}
                    </div>
                    <Input
                        placeholder="Название"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onPressEnter={() => {
                            if (newItemName.trim()) {
                                handleAddNewItem();
                            }
                        }}
                        autoFocus
                    />
                </Modal>
            </div>
        );
    }

    return (
        <Expandable onDoubleClick={startEditing} isEditable={isEditable}>
            <div className="min-h-[20px] h-full w-full flex items-center">
                {(value && value.trim() !== '') ? value : <span>&nbsp;</span>}
            </div>
        </Expandable>
    );
};