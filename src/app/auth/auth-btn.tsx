"use client"

import {Button} from "antd";
import {useState} from "react";
import AuthDialog from "./auth-dialog";

export default function AuthBtn() {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setDialogOpen(true)}>Войти</Button>
            <AuthDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </>
    );
}

