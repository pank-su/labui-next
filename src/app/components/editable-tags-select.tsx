"use client"

import { useState } from "react";
import { Button, Select, Space } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
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
    collectionId: number;
    onSave: (tags: TagType[]) => void;
    onCancel: () => void;
}

export default function EditableTagsSelect({
    value,
    collectionId,
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
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color || "#1677ff" }}
                />
                <div className="flex-1 min-w-0">
                    <span>{tag.name}</span>
                    {tag.description && (
                        <span className="text-gray-400 text-xs ml-1">({tag.description})</span>
                    )}
                </div>
            </div>
        ),
        value: tag.id!
    })) || [];

    return (
        <>
            <div className="flex w-full min-w-0">
                <Select
                    mode="multiple"
                    value={selectedTags.map(t => t.id!)}
                    onChange={handleSelectChange}
                    options={options}
                    placeholder="Выберите теги..."
                    className="flex-1 min-w-0"
                    loading={isLoading}
                    showSearch
                    size="small"
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
                <div className="flex gap-1 ml-1 flex-shrink-0">
                    <Button
                        onClick={onCancel}
                        icon={<CloseOutlined />}
                        danger
                        size="small"
                    />
                    <Button
                        onClick={async () => {
                            const tagIds = selectedTags.map(t => t.id!).filter(id => id !== null);
                            
                            const { error } = await supabase.rpc('update_collection_tags', {
                                target_collection_id: collectionId,
                                new_tag_ids: tagIds
                            });
                            
                            if (error) {
                                console.error('Error updating tags:', error);
                                return;
                            }
                            
                            onSave(selectedTags);
                        }}
                        icon={<CheckOutlined />}
                        size="small"
                    />
                </div>
            </div>

            
            <CreateTagDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSuccess={handleCreateSuccess}
            />
        </>
    );
}