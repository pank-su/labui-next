import {Avatar, Dropdown, Skeleton} from "antd";
import {MenuProps} from "antd/lib";
import {useMemo} from "react";
import {useUser} from "@/hooks/useUser";
import {useClient} from "@/utils/supabase/client";
import {useRouter} from "next/navigation";


function LogoutButton() {
    const supabase = useClient();
    const router = useRouter();
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };
    
    return (
        <button onClick={handleLogout} className="w-full text-left">
            Выйти
        </button>
    );
}

const items: MenuProps['items'] = [
    {
        key: '2',
        danger: true,
        label: <LogoutButton />
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