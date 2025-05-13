import {
    DownloadOutlined,
    EnvironmentOutlined,
    PlusOutlined,
    ReloadOutlined,
    SplitCellsOutlined,
    TableOutlined
} from "@ant-design/icons";
import {Button, Popconfirm, Tooltip} from "antd";
import {Table} from "@tanstack/react-table";
import {FormattedBasicView} from "@/app/(general)/models";
import NewId from "@/app/components/data-table/new-id";
import {useUser} from "@/app/components/header";
import {download, generateCsv, mkConfig} from "export-to-csv";
import {useInsertMutation} from "@supabase-cache-helpers/postgrest-react-query";
import {useClient} from "@/utils/supabase/client";
import {useRouter, useSearchParams} from "next/navigation";


export default function CollectionTableControls({table}: {
    table: Table<FormattedBasicView>
}) {


    const router = useRouter()

    const supabase = useClient()

    const csvConfig = mkConfig({useKeysAsHeaders: true});


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
                <Tooltip title={!userLoad.user ? "Для добавления записи нужно войти в аккаунт" : null}>
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
                            icon={<PlusOutlined />}
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
                        onClick={() => {
                            const rows = table.getRowModel().rows.map(row => ({
                                ...row.original,
                                collectors: row.original.collectors?.map((collector) => `${collector.last_name} ${collector.first_name} ${collector.second_name}`).join(","),
                                tags: row.original.tags?.map((t) => t.name).join(","),
                                order: row.original.order?.name,
                                family: row.original.family?.name,
                                genus: row.original.genus?.name,
                                kind: row.original.kind?.name
                            }));

                            const csv = generateCsv(csvConfig)(rows);
                            download(csvConfig)(csv);
                        }}
                    />
                </Tooltip>
            </div>

            {/* Кнопки переключения режимов отображения */}
            <div className="space-x-2">
                <Button.Group>
                    <Tooltip title="Показать только таблицу">
                        <Button
                            type={!false ? "primary" : "default"}
                            icon={<TableOutlined/>}
                            onClick={() => {
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Разделенный режим">
                        <Button
                            type={true ? "primary" : "default"}
                            icon={<SplitCellsOutlined/>}
                            onClick={() => {
                            }}
                        />
                    </Tooltip>

                </Button.Group>

                <Tooltip title="Открыть карту на весь экран">
                    <Button
                        type="primary"
                        ghost
                        icon={<EnvironmentOutlined/>}
                        onClick={() => router.push('/map')}
                    >
                        Карта
                    </Button>
                </Tooltip>
            </div>
        </div>
    </>
}