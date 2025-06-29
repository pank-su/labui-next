import {Column} from "@tanstack/react-table";
import {Button, Select, Space} from "antd";
import {useMemo} from "react";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";
import {ReloadOutlined} from "@ant-design/icons";
import {useQuery} from "@tanstack/react-query";
import {useClient} from "@/utils/supabase/client";
import {values} from "@/app/(general)/queries";

export default function SelectFilter({column, tableName, filters}: { column: Column<any>, tableName: string, filters: {
        [key: string]: string | string[] | undefined
    } }) {

    const supabase = useClient()


    const columnId = column.id.includes("_") ? column.id.split("_")[0] : column.id;


    const {data: uniqueValues} = useQuery(values(supabase, tableName, columnId === "voucher" ? column.id :  column.id.replace("_", "->>"), filters));

    // const uniqueValues = column.getFacetedUniqueValues()

    const options = useMemo(() => {
        //console.log(uniqueValues);
        if (uniqueValues?.data?.length === 0) {
            return []
        } else if (uniqueValues?.data) {
            // @ts-ignore
            return uniqueValues?.data.sort((item) => item.count).map((entry) => ({
                label: entry.value || " ",
                value: entry.value || " "
            }));
        }

    }, [uniqueValues])

    const {value, setValue} = useFilterQuery(columnId, (value) => {

            column.setFilterValue(value)

    }, () => {
        column.setFilterValue(undefined)
    }, [], (value) => value != " ")


    return <Space.Compact className="w-full"><Select value={value} className="w-full text-start" showSearch={true}
                   onSelect={(e) => {
                       setValue(e)

                   }} options={options}/>
        { value != "" && <Button onClick={(_) => setValue("")} icon={<ReloadOutlined/>}/>}
    </Space.Compact>
}