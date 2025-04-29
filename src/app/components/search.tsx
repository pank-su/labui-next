import { SearchOutlined } from "@ant-design/icons";
import { Space, Mentions, Button, Input } from "antd";
import { useSearch } from "./search-context";
import { useState } from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

export function Search() {
    const router = useRouter();
    const pathname = usePathname()

    const searchParams = useSearchParams()
    const search = searchParams.get('q') ?? "";

    
    // const {setSearch, search} = useSearch()

    const [query, setQuery] = useState<string>(search)

    const searchHook = () => {
        const params = new URLSearchParams(search);
        if (query.trim() != "") {
            params.set("q", query);
            router.push(pathname + "?" + params.toString());
        }else{
            router.push(pathname);
        }
    }


    return <Space direction="horizontal" className="max-w-96">
        <Input placeholder="Найти запись" value={query} onKeyDown={(e) => {
            if (e.key === "Enter") {
                searchHook()
            }
        }}  onChange={(e) => {
            setQuery(e.target.value)
        }}  />{/* SEARCH */}
        <Button onClick={()=> {
            searchHook()
        }}>
            <SearchOutlined  />
        </Button>
    </Space>
}