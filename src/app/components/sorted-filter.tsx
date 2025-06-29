import {UpOutlined, DownOutlined} from "@ant-design/icons"
import {SortDirection} from "@tanstack/react-table"


interface SortedIconProps {
    isSorted: false | SortDirection,
}

export function SortedIcon({isSorted}: SortedIconProps) {
    if (!isSorted) return <></>
    if (isSorted === "asc") {
        return <UpOutlined style={{color: '#1677ff'}}/>
    }
    return <DownOutlined style={{color: '#1677ff'}}/>
}

