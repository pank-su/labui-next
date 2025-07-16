import { type ColumnDef } from "@tanstack/react-table";
import type { Tables } from "@/utils/supabase/gen-types";
import { EditableCell } from "@/app/components/data-table/editable";
import { useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { useClient } from "@/utils/supabase/client";
import { useUser } from "@/hooks/useUser";

type Collector = Tables<"collector">;

export const useCollectorsColumns = () => {
    const supabase = useClient();
    const { user } = useUser();

    const { mutateAsync: update } = useUpdateMutation(
        supabase.from("collector"),
        ['id']
    );

    const createEditableCell = (fieldName: string, savePayload: (value: string | null, rowId: number) => any) =>
        (info: any) => (
            <EditableCell
                cellValue={info.getValue()}
                onSave={(value) => update(savePayload(value, info.row.getValue("id")))}
                user={user}
                rowId={info.row.getValue("id")}
                fieldName={fieldName}
            />
        );

    const columns: ColumnDef<Collector>[] = [
        {
            accessorKey: "id",
            header: "ID",
            size: 80,
            meta: {
                filterVariant: "index",
            },
        },
        {
            accessorKey: "last_name",
            header: "Фамилия",
            cell: createEditableCell("last_name", (value, rowId) => ({
                id: rowId,
                last_name: value
            })),
            meta: {
                filterVariant: "input",
            },
        },
        {
            accessorKey: "first_name",
            header: "Имя",
            cell: createEditableCell("first_name", (value, rowId) => ({
                id: rowId,
                first_name: value
            })),
            meta: {
                filterVariant: "input",
            },
        },
        {
            accessorKey: "second_name",
            header: "Отчество",
            cell: createEditableCell("second_name", (value, rowId) => ({
                id: rowId,
                second_name: value
            })),
            meta: {
                filterVariant: "input",
            },
        },
    ];

    return columns;
};