"use client"

import {Select, Skeleton} from "antd";
import Navigation from "./navigation";
import {Search} from "./search";
import {Suspense} from "react";
import AuthBtn from "./auth-btn";
import ProfileAvatar from "./profile-avatar";
import {usePathname} from "next/navigation";
import {useUser} from "@/hooks/useUser";


const options = [
    {value: "", label: "Коллекция"},
    {value: "collectors", label: "Коллекторы"},
    {value: "institutes", label: "Ваучерные институты"},
]

export default function Header() {

    const pathname = usePathname()

    return (
        <div className="w-full h-full px-8 flex justify-between items-center">
            <AuthOrAvatar/>
            <Navigation/>
            <Suspense>
                <Search/>
            </Suspense>
            <Select
                defaultValue={pathname.slice(1)}
                options={options}
                className="w-32"
                styles={{popup: {root: {minWidth: "150px"}}}}
                popupRender={(menu) => (
                    <div>
                        {options.map((option) => (
                            <a
                                key={option.value}
                                href={`/${option.value}`}
                                className="block px-4 py-2 hover:bg-gray-100 text-black no-underline"
                            >
                                {option.label}
                            </a>
                        ))}
                    </div>
                )}
            />
        </div>
    )
}


/**
 * Кнопка или аватар авторизации
 */
function AuthOrAvatar() {
    const {user, isLoading} = useUser();

    if (isLoading) {
        return <Skeleton.Avatar active/>;
    }
    if (!user) {
        return <AuthBtn/>;
    }

    return <ProfileAvatar/>
}