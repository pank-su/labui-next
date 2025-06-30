import {DownloadOutlined, EnvironmentOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {Button, Popconfirm, Tooltip} from "antd";
import {Table} from "@tanstack/react-table";
import {FormattedBasicView} from "@/app/(general)/models";
import NewId from "@/app/components/data-table/new-id";
import {useUser} from "@/app/components/header";
import {useInsertMutation} from "@supabase-cache-helpers/postgrest-react-query";
import {useClient} from "@/utils/supabase/client";
import {useRouter} from "next/navigation";
import {getBasicViewModelCsv} from "@/app/(general)/queries";
import {downloadCSV} from "@/app/(general)/utils";


export default function CollectionTableControls({table, filters}: {
    table: Table<FormattedBasicView>, filters: { [key: string]: string | string[] | undefined }
}) {


    const router = useRouter()

    const supabase = useClient()



    const userLoad = useUser();

    const {mutateAsync: insert} = useInsertMutation(
        supabase.from("collection"),
        ["id"],
        "id",
        {
            onSuccess(data, variables, context) {
            },
        }
    )

    return <>
        <div className="p-2 flex justify-between items-center">
            <div className="space-x-2">
                <Tooltip title={!userLoad.user ? "Для добавления записи нужно войти в аккаунт" : undefined}>
                    <Popconfirm
                        placement="right"
                        okText="Да"
                        cancelText="Нет"
                        icon={<PlusOutlined style={{color: "blue"}}/>}
                        onConfirm={() => insert([])}
                        title={<>Вы точно хотите добавить запись с ID <NewId
                            column={table.getColumn("id") ?? null}/></>}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            disabled={!userLoad.user || userLoad.isLoading}
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