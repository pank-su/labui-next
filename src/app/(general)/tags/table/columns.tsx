import { type ColumnDef } from "@tanstack/react-table";
import type { Tables } from "@/utils/supabase/gen-types";
import { EditableCell } from "@/app/components/data-table/editable";
import { ColorPickerCell } from "@/app/components/data-table/color-picker-cell";
import { useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { useClient } from "@/utils/supabase/client";
import { useUser } from "@/hooks/useUser";

type Tag = Tables<"tags">;

export const useTagsColumns = () => {
    const supabase = useClient();
    const { user } = useUser();

    const { mutateAsync: update } = useUpdateMutation(
        supabase.from("tags"),
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

    const columns: ColumnDef<Tag>[] = [
        {
            accessorKey: "id",
            header: "ID",
            size: 80,
            meta: {
                filterVariant: "index",
            },
        },
        {
            accessorKey: "name",
            header: "Название",
            cell: createEditableCell("name", (value, rowId) => ({
                id: rowId,
                name: value
            })),
            meta: {
                filterVariant: "input",
            },
        },
        {
            accessorKey: "description",
            header: "Описание",
            size: 300,
            cell: createEditableCell("description", (value, rowId) => ({
                id: rowId,
                description: value
            })),
            meta: {
                filterVariant: "input",
            },
        },
        {
            accessorKey: "color",
            header: "Цвет",
            cell: (info: any) => (
                <ColorPickerCell
                    value={info.getValue()}
                    rowId={info.row.getValue("id")}
                    isEditing={!!user}
                    onSave={async (rowId, value) => {
                        await update({
                            id: rowId,
                            color: value
                        });
                    }}
                    onCancel={() => {}}
                    isEditable={!!user}
                />
            ),
            meta: {
                filterVariant: "input",
            },
        },
    ];

    return columns;
};