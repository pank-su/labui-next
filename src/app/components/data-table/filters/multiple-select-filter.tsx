import { Column } from "@tanstack/react-table";
import { Button, Select, Space } from "antd";
import { useMemo } from "react";
import { useFilterQuery } from "@/app/components/data-table/filters/utils";
import { ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useClient } from "@/utils/supabase/client";

export default function MultipleSelectFilter({
                                                 column,
                                                 tableName,
                                                 filters,
                                             }: {
    column: Column<any>;
    tableName: string;
    filters: {
        [key: string]: string | string[] | undefined;
    };
}) {
    const supabase = useClient();

    const columnId = column.id.includes("_")
        ? column.id.split("_")[0]
        : column.id;

    const { data: uniqueValues } = useQuery(
        {
            queryKey: [columnId],
            queryFn: async () => {
                switch (columnId) {
                    case "tags":
                        return supabase.from("tags").select("name,id")
                    case "collectors":
                        return supabase.from("collector").select("name:last_name,id")
                }
            }
        }
    );

    const options = useMemo(() => {
        if (uniqueValues?.data?.length === 0) {
            return [];
        } else if (uniqueValues?.data) {
            if (columnId == "tags") {
                return uniqueValues?.data
                .map((entry) => ({
                    label: entry.name || "",
                    value: String(entry.id || ""), // Приводим к строке
                }));
            } else if (columnId == "collectors") {
                return uniqueValues?.data
                .map((entry) => ({
                    label: entry.name || "",
                    value: String(entry.id || ""), // Приводим к строке
                }));
            }
        }
    }, [uniqueValues, columnId]);

    const { value, setValue } = useFilterQuery(
        columnId,
        (value) => {

            column.setFilterValue(value);
        },
        () => {
            column.setFilterValue(undefined);
        },
        [], // default value as empty array for multiple select
    );


    const selectedValues = value ? value.split(",").filter(Boolean) : [];

    return (
        <Space.Compact className="w-full">
            <Select
                mode="multiple"
                value={selectedValues || []}
                className="w-full text-start"
                showSearch={true}
                placeholder="Выберите значения..."
                onChange={(selectedValues: string[]) => {
                    setValue(selectedValues.join(","));
                }}
                options={options}
            />
            {value && value.length > 0 && (
                <Button onClick={() => setValue("")} icon={<ReloadOutlined />} />
            )}
        </Space.Compact>
    );
}