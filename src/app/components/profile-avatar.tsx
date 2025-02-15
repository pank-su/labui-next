import { UserOutlined } from "@ant-design/icons";
import { User } from "@supabase/supabase-js";
import { Avatar, Dropdown, Skeleton } from "antd";
import { MenuProps } from "antd/lib";
import { data } from "autoprefixer";
import { useEffect, useState } from "react";
import { singOutAction } from "../auth/actions";
import { useClient } from "@/utils/supabase/client";


const items: MenuProps['items'] = [
    {
        key: '2',
        danger: true,
        label: (<form><button formAction={singOutAction}>Выйти</button></form>)
    }
]


/**
 * Аватар профиля
 */
export default function ProfileAvatar() {

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const supabase = useClient()

    useEffect(() => {
        async function fetchProfile() {
            const { data } = await supabase.from('profiles').select()

            setAvatarUrl(data![0].avatar ?? "https://api.dicebear.com/9.x/lorelei/svg?backgroundColor=b6e3f4&seed=" + data![0].id) // Если аватарки нет, то генерируем по идентификатору пользователя
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