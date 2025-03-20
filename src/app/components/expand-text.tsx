import { useState } from "react";

export default function ExpandableAndEditableText({ children, editField }: { children: React.ReactNode, editField: React.ReactNode }) {
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            className={`cursor-pointer ${expanded ? '' : 'truncate'} w-full`}
        >
            {isEditing ? editField : children}
        </div>
    );
};
