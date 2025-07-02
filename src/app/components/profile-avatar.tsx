import {Avatar, Dropdown, Skeleton} from "antd";
import {MenuProps} from "antd/lib";
import {useMemo} from "react";
import {singOutAction} from "../auth/actions";
import {useUser} from "./header";


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
    const {user, isLoading} = useUser();

    const avatarUrl = useMemo(() => {
        if (!user) {
            return null
        }
        return user.user_metadata?.avatar_url ?? generateAvatar(user.id)
    }, [user])

    if (isLoading) {
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