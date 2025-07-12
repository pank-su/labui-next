"use client"

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Tag } from "antd";
import ExpandableTags from "../expandable-tags";
import EditableCollectorsSelect from "../editable-collectors-select";

export interface Collector {
    id: number | null;
    first_name?: string | null;
    last_name?: string | null;
    second_name?: string | null;
}

interface CollectorsCellProps {
    collectors: Collector[] | null;
    user?: User | null;
    rowId: number;
    onSave: (collectors: Collector[]) => Promise<void>;
    onStartEditing?: (rowId: number, fieldName: string) => void;
    onStopEditing?: (rowId: number, fieldName: string) => void;
    isFieldEditing?: (rowId: number, fieldName: string) => boolean;
}

export default function CollectorsCell({
    collectors,
    user,
    rowId,
    onSave,
    onStartEditing,
    onStopEditing,
    isFieldEditing
}: CollectorsCellProps) {
    const [isEdit, setIsEdit] = useState(false);
    
    const useControlledState = onStartEditing && onStopEditing && isFieldEditing;
    const isEditing = useControlledState ? isFieldEditing(rowId, "collectors") : isEdit;
    
    const handleStartEdit = () => {
        if (useControlledState) {
            onStartEditing!(rowId, "collectors");
        } else {
            setIsEdit(true);
        }
    };
    
    const handleStopEdit = () => {
        if (useControlledState) {
            onStopEditing!(rowId, "collectors");
        } else {
            setIsEdit(false);
        }
    };

    const formatCollectorName = (collector: Collector) => {
        const surname = collector.last_name || "";
        const firstInitial = collector.first_name ? collector.first_name.charAt(0) + "." : "";
        const secondInitial = collector.second_name ? collector.second_name.charAt(0) + "." : "";
        return `${surname} ${firstInitial}${secondInitial}`.trim();
    };

    if (isEditing) {
        return (
            <EditableCollectorsSelect
                value={collectors || []}
                onSave={async (newCollectors) => {
                    await onSave(newCollectors);
                    handleStopEdit();
                }}
                onCancel={handleStopEdit}
            />
        );
    }

    return (
        <div 
            onDoubleClick={() => user && handleStartEdit()}
            className={`w-full h-full ${user ? "cursor-pointer" : ""}`}
        >
            {(!collectors || collectors.length === 0) ? (
                <div className="w-full h-full" />
            ) : (
                <ExpandableTags>
                    {collectors.map((collector, index) => (
                        <Tag key={index} className="text-xs">
                            {formatCollectorName(collector)}
                        </Tag>
                    ))}
                </ExpandableTags>
            )}
        </div>
    );
}