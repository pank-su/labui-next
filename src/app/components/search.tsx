import { SearchOutlined } from "@ant-design/icons";
import { Space, Mentions, Button } from "antd";

export function Search() {
    return <Space direction="horizontal" className="max-w-96">
        <Mentions placeholder="@kind some-kind" />{/* SEARCH */}
        <Button>
            <SearchOutlined />
        </Button>
    </Space>
}