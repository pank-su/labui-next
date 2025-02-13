import { useState } from "react";

export default function ExpandableText({ children }: { children: any }){
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            onClick={() => setExpanded(true)}
            className={`cursor-pointer ${expanded ? '' : 'truncate'}`}
        >
            {children}
        </div>
    );
};
