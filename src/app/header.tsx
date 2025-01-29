"use client";


import { Avatar, Breadcrumb, Button, Mentions, Space } from "antd";
import { Search } from "./search";
import Navigation from "./navigation";
import { SearchOutlined } from "@ant-design/icons";


const testImage = "https://images.dog.ceo/breeds/akita/An_Akita_Inu_resting.jpg"

export default function Header() {
    return <div className="w-full h-full px-8 flex justify-between items-center">
        <Avatar></Avatar>
        <Navigation />
        <Space direction="horizontal" className="max-w-96">
        <Mentions   placeholder="@kind some-kind" />{/* SEARCH */}
        <Button>
            <SearchOutlined/>
        </Button>
        </Space>
        <Avatar.Group size={"small"}>
            <Avatar />
            <Avatar />
            <Avatar />


        </Avatar.Group>
    </div>
}