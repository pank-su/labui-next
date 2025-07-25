import {DownloadOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {Button, Popconfirm, Tooltip} from "antd";
import {Table} from "@tanstack/react-table";
import {FormattedBasicView} from "@/app/(general)/models";
import NewId from "@/app/components/data-table/new-id";
import {useUser} from "@/hooks/useUser";
import {useInsertMutation} from "@supabase-cache-helpers/postgrest-react-query";
import {useClient} from "@/utils/supabase/client";
import {useRouter} from "next/navigation";
import {getBasicViewModelCsv} from "@/app/(general)/queries";
import {downloadCSV} from "@/app/(general)/utils";
import {useEffect, useState} from "react";


export default function CollectionTableControls({table, filters}: {
    table: Table<FormattedBasicView>, filters: { [key: string]: string | string[] | undefined }
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const router = useRouter()

    const supabase = useClient()


    const userLoad = useUser();

    const {mutateAsync: insert} = useInsertMutation(
        supabase.from("collection"),
        ["id"],
        "id",
        {
            onError: (error) => {
                console.log(error)
            },
            onSuccess(data, variables, context) {
            },
        }
    )

    return <>
        <div className="p-2 flex justify-between items-center">
            <div className="space-x-2">
                <Tooltip
                    title={mounted && !userLoad.user && !userLoad.isLoading ? "Для добавления записи нужно войти в аккаунт" : ""}>
                    <Popconfirm
                        placement="right"
                        okText="Да"
                        cancelText="Нет"
                        icon={<PlusOutlined style={{color: "blue"}}/>}
                        onConfirm={() => insert([{}])}
                        title={mounted ? <>Вы точно хотите добавить запись с
                            ID <NewId/></> : "Вы точно хотите добавить запись?"}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            disabled={!mounted || !userLoad.user || userLoad.isLoading}
                        >
                            Добавить запись
                        </Button>
                    </Popconfirm>
                </Tooltip>

                <Tooltip title="Сбросить фильтры">
                    <Button
                        type="text"
                        icon={<ReloadOutlined/>}
                        onClick={() => router.push("/")}
                    />
                </Tooltip>

                <Tooltip title="Экспорт">
                    <Button
                        type="text"
                        icon={<DownloadOutlined/>}
                        onClick={async () => {
                            const csv = await getBasicViewModelCsv(supabase, filters)
                            if (csv.data) {
                                downloadCSV(csv.data, "collection.csv")
                            }
                        }}
                    />
                </Tooltip>
            </div>

            {/* Кнопки переключения режимов отображения */}
            {/*<div className="space-x-2">*/}
            {/*    <Tooltip title="Открыть карту на весь экран">*/}
            {/*        <Button*/}
            {/*            type="primary"*/}
            {/*            ghost*/}
            {/*            icon={<EnvironmentOutlined/>}*/}
            {/*            onClick={() => router.push('/map')}*/}
            {/*        >*/}
            {/*            Карта*/}
            {/*        </Button>*/}
            {/*    </Tooltip>*/}
            {/*</div>*/}
        </div>
    </>
}