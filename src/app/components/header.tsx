"use client";

import { Avatar } from "antd";
import Navigation from "./navigation";
import { Search } from "./search";


export default function Header() {
    return <div className="w-full h-full px-8 flex justify-between items-center">
        <Avatar>
            
        </Avatar>
        <Navigation />
        <Search />
        <Avatar.Group size={"small"}>
            <Avatar />
            <Avatar />
            <Avatar />


        </Avatar.Group>
    </div>
}