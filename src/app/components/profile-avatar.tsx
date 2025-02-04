import { createClient } from "@/src/utils/supabase/client";
import { UserOutlined } from "@ant-design/icons";
import { User } from "@supabase/supabase-js";
import { Avatar, Dropdown, Skeleton } from "antd";
import { MenuProps } from "antd/lib";
import { data } from "autoprefixer";
import { useEffect, useState } from "react";


const items: MenuProps['items'] = [
    {
        key: '2',
        danger: true,
        label: "Выйти"
    }
]


/**
 * Аватар профиля
 */
export default function ProfileAvatar() {

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProfile() {
            const supabase = await createClient()
            const { data } = await supabase.from('profiles').select()

            setAvatarUrl(data![0].avatar ?? "https://api.dicebear.com/9.x/lorelei/svg?backgroundColor=b6e3f4&seed=" + data![0].id)
            // if data![0].avatar)
        }
        fetchProfile()

    }, [])
    if (avatarUrl == null) {
        return <Skeleton.Avatar />
    }
    return (
    <Dropdown menu={{
        items
    }} arrow>
        <Avatar src={avatarUrl} onClick={(e) => e?.preventDefault()}/>
    </Dropdown>
    )
}