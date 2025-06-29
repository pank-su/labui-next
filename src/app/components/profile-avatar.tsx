import {Avatar, Dropdown, Skeleton} from "antd";
import {MenuProps} from "antd/lib";
import {useMemo} from "react";
import {singOutAction} from "../auth/actions";
import {useClient} from "@/utils/supabase/client";
import {useQuery} from "@supabase-cache-helpers/postgrest-react-query";


const items: MenuProps['items'] = [
    {
        key: '2',
        danger: true,
        label: (<form>
            <button formAction={singOutAction}>Выйти</button>
        </form>)
    }
]


export function generateAvatar(seed: String) {
    return "https://api.dicebear.com/9.x/lorelei/svg?backgroundColor=b6e3f4&seed=" + seed
}

/**
 * Аватар профиля
 */
export default function ProfileAvatar() {

    const supabase = useClient()

    const {data, isPending} = useQuery(supabase.from("profiles").select())

    const avatarUrl = useMemo(() => {
        if (!data) {
            return null
        }
        return data[0]?.avatar ?? generateAvatar(data[0]?.id)
    }, [data])


    if (isPending) {
        return <Skeleton.Avatar/>
    }
    return (
        <Dropdown menu={{
            items
        }} arrow>
            <Avatar src={avatarUrl} onClick={(e) => e?.preventDefault()}/>
        </Dropdown>
    )
}