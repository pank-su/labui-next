"use client"

import { useState } from "react";
import { Button, Select, Space } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useClient } from "@/utils/supabase/client";
import CreateCollectorDialog from "./create-collector-dialog";

interface Collector {
    id: number | null;
    first_name?: string | null;
    last_name?: string | null;
    second_name?: string | null;
}

interface EditableCollectorsSelectProps {
    value: Collector[];
    collectionId: number;
    onSave: (collectors: Collector[]) => void;
    onCancel: () => void;
}

export default function EditableCollectorsSelect({
    value,
    collectionId,
    onSave,
    onCancel
}: EditableCollectorsSelectProps) {
    const [selectedCollectors, setSelectedCollectors] = useState<Collector[]>(value);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    
    const supabase = useClient();

    const { data: allCollectors, isLoading } = useQuery({
        queryKey: ["collectors-all"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("collector")
                .select("id, first_name, last_name, second_name")
                .order("last_name");
            if (error) throw error;
            return data;
        }
    });

    const formatCollectorName = (collector: Collector) => {
        const surname = collector.last_name || "";
        const firstInitial = collector.first_name ? collector.first_name.charAt(0) + "." : "";
        const secondInitial = collector.second_name ? collector.second_name.charAt(0) + "." : "";
        return `${surname} ${firstInitial}${secondInitial}`.trim();
    };

    const handleSelectChange = (selectedIds: number[]) => {
        const newSelectedCollectors = selectedIds.map(id => 
            allCollectors?.find(collector => collector.id === id)
        ).filter(Boolean) as Collector[];
        setSelectedCollectors(newSelectedCollectors);
    };

    const handleCreateSuccess = (newCollector: Collector) => {
        setSelectedCollectors(prev => [...prev, newCollector]);
        setShowCreateDialog(false);
    };

    const options = allCollectors?.map(collector => ({
        label: formatCollectorName(collector),
        value: collector.id!
    })) || [];

    return (
        <>
        <Space.Compact size="small" className="w-full">
                <Select
                    mode="multiple"
                    value={selectedCollectors.map(c => c.id!)}
                    onChange={handleSelectChange}
                    options={options}
                    placeholder="Выберите коллекторов..."
                    className="w-full"
                    loading={isLoading}
                    showSearch
                    filterOption={(input, option) => {
                        if (!input) return true;
                        const label = option?.label ?? '';
                        return typeof label === 'string' ? 
                            label.toLowerCase().includes(input.toLowerCase()) : 
                            false;
                    }}
                    dropdownRender={(menu) => (
                        <div>
                            {menu}
                            <div className="p-2 border-t">
                                <Button 
                                    type="text" 
                                    onClick={() => setShowCreateDialog(true)}
                                    className="w-full text-left"
                                >
                                    + Создать
                                </Button>
                            </div>
                        </div>
                    )}
                />
                <Button
                    onClick={onCancel}
                    icon={<CloseOutlined />}
                    danger
                />
                <Button
                    onClick={async () => {
                        const collectorIds = selectedCollectors.map(c => c.id!).filter(id => id !== null);
                        
                        const { error } = await supabase.rpc('update_collection_collectors', {
                            target_collection_id: collectionId,
                            new_collector_ids: collectorIds
                        });
                        
                        if (error) {
                            console.error('Error updating collectors:', error);
                            return;
                        }
                        
                        onSave(selectedCollectors);
                    }}
                    icon={<CheckOutlined />}
                />
            </Space.Compact>

            
            <CreateCollectorDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSuccess={handleCreateSuccess}
            />
        </>
    );
}