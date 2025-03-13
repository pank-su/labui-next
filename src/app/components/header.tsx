"use client"

import { Avatar, Select, Skeleton } from "antd";
import Navigation from "./navigation";
import { Search } from "./search";
import { useEffect, useMemo, useState } from "react";
import AuthBtn from "./auth-btn";
import { User } from "@supabase/supabase-js";
import ProfileAvatar from "./profile-avatar";
import { useClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


const options = [
    { value: "", label: "Коллекция" },
    { value: "collectors", label: "Коллекторы" },
    { value: "institutes", label: "Ваучерные институты" },
]

export default function Header() {

    return (
        <div className="w-full h-full px-8 flex justify-between items-center">
            <AuthOrAvatar />
            <Navigation />
            <Search />
            <Select
                defaultValue={""}
                options={options}
                className="w-32"
                dropdownStyle={{ minWidth: '150px' }}
                dropdownRender={(menu) => (
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
    const supabase = useClient()

    const { data, isLoading } = useQuery({ queryKey: ["supabase-get-user"], queryFn: () => supabase.auth.getUser() })

    const user = data?.data.user;

    if (isLoading) {
        return <Skeleton.Avatar active />;
    }
    if (!user) {
        return <AuthBtn />;
    }

    return <ProfileAvatar />
}