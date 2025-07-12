"use client"

import { useState } from "react";
import { Button, Select, Space } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useClient } from "@/utils/supabase/client";
import CreateTagDialog from "./create-tag-dialog";

interface TagType {
    id: number | null;
    name: string | null;
    description?: string | null;
    color?: string | null;
}

interface EditableTagsSelectProps {
    value: TagType[];
    onSave: (tags: TagType[]) => void;
    onCancel: () => void;
}

export default function EditableTagsSelect({
    value,
    onSave,
    onCancel
}: EditableTagsSelectProps) {
    const [selectedTags, setSelectedTags] = useState<TagType[]>(value);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    
    const supabase = useClient();

    const { data: allTags, isLoading } = useQuery({
        queryKey: ["tags-all"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tags")
                .select("id, name, description, color")
                .order("name");
            if (error) throw error;
            return data;
        }
    });

    const handleSelectChange = (selectedIds: number[]) => {
        const newSelectedTags = selectedIds.map(id => 
            allTags?.find(tag => tag.id === id)
        ).filter(Boolean) as TagType[];
        setSelectedTags(newSelectedTags);
    };

    const handleCreateSuccess = (newTag: TagType) => {
        setSelectedTags(prev => [...prev, newTag]);
        setShowCreateDialog(false);
    };

    const options = allTags?.map(tag => ({
        label: (
            <div className="flex items-center gap-2">
                <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: tag.color || "#1677ff" }}
                />
                <span>{tag.name}</span>
                {tag.description && (
                    <span className="text-gray-400 text-xs">({tag.description})</span>
                )}
            </div>
        ),
        value: tag.id!
    })) || [];

    return (
        <>
            <Space.Compact className="w-full">
                <Select
                    mode="multiple"
                    value={selectedTags.map(t => t.id!)}
                    onChange={handleSelectChange}
                    options={options}
                    placeholder="Выберите теги..."
                    className="w-full"
                    loading={isLoading}
                    showSearch
                    filterOption={(input, option) => {
                        if (!input) return true;
                        const tag = allTags?.find(t => t.id === option?.value);
                        if (!tag) return false;
                        
                        const inputLower = input.toLowerCase();
                        const nameMatch = tag.name ? tag.name.toLowerCase().includes(inputLower) : false;
                        const descMatch = tag.description ? tag.description.toLowerCase().includes(inputLower) : false;
                        
                        return nameMatch || descMatch;
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
                    onClick={() => onSave(selectedTags)}
                    size="small"
                    icon={<CheckOutlined />}
                />
            </Space.Compact>

            
            <CreateTagDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSuccess={handleCreateSuccess}
            />
        </>
    );
}