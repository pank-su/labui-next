import {SortAscendingOutlined, SortDescendingOutlined} from "@ant-design/icons"
import {SortDirection} from "@tanstack/react-table"


interface SortedIconProps {
    isSorted: false | SortDirection,
}

export function SortedIcon({isSorted}: SortedIconProps) {
    if (!isSorted) return <></>
    if (isSorted === "asc") {
        return <SortAscendingOutlined style={{color: '#1677ff'}}/>
    }
    return <SortDescendingOutlined style={{color: '#1677ff'}}/>
}

