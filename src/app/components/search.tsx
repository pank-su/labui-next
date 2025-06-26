import {SearchOutlined} from "@ant-design/icons";
import {Button, Input, Space} from "antd";
import {useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

export function Search() {
    const router = useRouter();
    const pathname = usePathname()

    const searchParams = useSearchParams()
    const search = searchParams.get("q") ?? "";


    const [query, setQuery] = useState<string>(search)

    const searchHook = () => {
        const params = new URLSearchParams(searchParams);
        if (query.trim() != "") {
            params.set("q", query);
        }else{
            params.delete("q")
        }
        if (params.size != 0) router.push(pathname + "?" + params.toString());
        else {
            router.push(pathname)
        }
    }


    return <Space direction="horizontal" className="max-w-96">
        <Input placeholder="Найти запись" value={query} onKeyDown={(e) => {
            if (e.key === "Enter") {
                searchHook()
            }
        }} onChange={(e) => {
            setQuery(e.target.value)
        }}/>{/* SEARCH */}
        <Button onClick={() => {
            searchHook()
        }}>
            <SearchOutlined/>
        </Button>
    </Space>
}