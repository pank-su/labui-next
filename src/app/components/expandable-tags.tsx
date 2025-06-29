import { useState, useRef, useEffect } from "react";

export default function ExpandableTags({ children }: { children: React.ReactNode }) {
    const [expanded, setExpanded] = useState(false);
    const [hasOverflow, setHasOverflow] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const testRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current && testRef.current) {
            // Сравниваем высоту свернутого и развернутого контента
            const clampedHeight = contentRef.current.clientHeight;
            const fullHeight = testRef.current.clientHeight;
            setHasOverflow(fullHeight > clampedHeight);
        }
    }, [children]);

    return (
        <div className="w-full relative">
            {/* Скрытый элемент для измерения полной высоты */}
            <div
                ref={testRef}
                className="absolute opacity-0 pointer-events-none flex flex-wrap gap-1"
                style={{ width: contentRef.current?.clientWidth || 'auto' }}
            >
                {children}
            </div>
            
            {/* Основной контент */}
            <div
                ref={contentRef}
                onClick={() => (hasOverflow || expanded) && setExpanded(!expanded)}
                className={`${(hasOverflow || expanded) ? 'cursor-pointer' : ''} w-full ${expanded ? '' : 'line-clamp-1 overflow-hidden'}`}
            >
                <div className={`flex flex-wrap gap-1 ${expanded ? '' : 'flex-nowrap'}`}>
                    {children}
                </div>
                {!expanded && hasOverflow && (
                    <div className="absolute right-0 top-0 bg-gradient-to-l from-white via-white to-transparent pl-4 text-gray-400 text-xs">
                        ...
                    </div>
                )}
            </div>
        </div>
    );
}