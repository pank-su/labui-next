import {MouseEventHandler, useState} from "react";


export default function ExpandableText({onDoubleClick, children}: {
    onDoubleClick?: MouseEventHandler<HTMLDivElement>,
    children: React.ReactNode,

}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            onDoubleClick={onDoubleClick}
            className={`cursor-pointer ${expanded ? '' : 'truncate'} w-full`}
        >
            {children}
        </div>
    );
};
