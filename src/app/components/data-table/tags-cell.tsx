"use client"

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Tag, Tooltip } from "antd";
import ExpandableTags from "../expandable-tags";
import EditableTagsSelect from "../editable-tags-select";
import Expandable from "../expandable";

export interface TagType {
    id: number | null;
    name: string | null;
    description?: string | null;
    color?: string | null;
}

interface TagsCellProps {
    tags: TagType[] | null;
    user?: User | null;
    rowId: number;
    onSave: (tags: TagType[]) => Promise<void>;
    onStartEditing?: (rowId: number, fieldName: string) => void;
    onStopEditing?: (rowId: number, fieldName: string) => void;
    isFieldEditing?: (rowId: number, fieldName: string) => boolean;
}

export default function TagsCell({
    tags,
    user,
    rowId,
    onSave,
    onStartEditing,
    onStopEditing,
    isFieldEditing
}: TagsCellProps) {
    const [isEdit, setIsEdit] = useState(false);
    
    const useControlledState = onStartEditing && onStopEditing && isFieldEditing;
    const isEditing = useControlledState ? isFieldEditing(rowId, "tags") : isEdit;
    
    const handleStartEdit = () => {
        if (useControlledState) {
            onStartEditing!(rowId, "tags");
        } else {
            setIsEdit(true);
        }
    };
    
    const handleStopEdit = () => {
        if (useControlledState) {
            onStopEditing!(rowId, "tags");
        } else {
            setIsEdit(false);
        }
    };

    if (isEditing) {
        return (
            <EditableTagsSelect
                value={tags || []}
                collectionId={rowId}
                onSave={async (newTags) => {
                    await onSave(newTags);
                    handleStopEdit();
                }}
                onCancel={handleStopEdit}
            />
        );
    }

    return (
        <Expandable 
            onDoubleClick={() => user && handleStartEdit()}
            isEditable={!!user}
        >
            <div className="min-h-[20px] w-full">
                {(!tags || tags.length === 0) ? (
                <div className="min-h-[20px] w-full" />
                ) : (
                    <ExpandableTags>
                        {tags.map((tag) => (
                            <Tooltip key={tag.id!} title={tag.description} color={tag.color ?? "blue"}>
                                <Tag color={tag.color ?? "blue"}>{tag.name}</Tag>
                            </Tooltip>
                        ))}
                    </ExpandableTags>
                )}
            </div>
        </Expandable>
    );
}