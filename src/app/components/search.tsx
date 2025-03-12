import { SearchOutlined } from "@ant-design/icons";
import { Space, Mentions, Button } from "antd";
import { useSearch } from "./search-context";
import { useState } from "react";

export function Search() {

    
    const {setSearch, search} = useSearch()

    const [query, setQuery] = useState<string>(search)

    return <Space direction="horizontal" className="max-w-96">
        <Mentions placeholder="Найти запись" value={query} onChange={setQuery} />{/* SEARCH */}
        <Button onClick={()=> setSearch(query)}>
            <SearchOutlined  />
        </Button>
    </Space>
}