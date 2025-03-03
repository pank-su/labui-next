import { Avatar, Skeleton } from "antd";
import Navigation from "./navigation";
import { Search } from "./search";
import { useEffect, useState } from "react";
import AuthBtn from "./auth-btn";
import { User } from "@supabase/supabase-js";
import ProfileAvatar from "./profile-avatar";
import { useClient } from "@/utils/supabase/client";


export default function Header() {
    return <div className="w-full h-full px-8 flex justify-between items-center">
        <AuthOrAvatar />

        <Navigation />
        <Search />
        <Avatar.Group size={"small"}>
            <Avatar />
            <Avatar />
            <Avatar />

        </Avatar.Group>
    </div>
}

/**
 * Кнопка или аватар авторизации
 */
function AuthOrAvatar() {
    const supabase = useClient()    

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        }
        fetchUser();
    }, []);

    if (loading) {
        return <Skeleton.Avatar active />;
    }
    if (!user) {
        return <AuthBtn />;
    }

    return <ProfileAvatar />
}