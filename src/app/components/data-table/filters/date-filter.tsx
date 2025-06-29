import {Column} from "@tanstack/react-table";
import {Button, Input, Space} from "antd";
import {MinusOutlined} from "@ant-design/icons";
import {useFilterQuery} from "@/app/components/data-table/filters/utils";
import {useEffect, useState} from "react";
import {parseDate, ParsedDate} from "@/utils/date";

export type FilterDate = {
    from: ParsedDate | null;
    to: ParsedDate | null;
}

export default function DateFilter({column}: { column: Column<any> }) {
    const columnId = column.id;

    const [fromError, setFromError] = useState(false)
    const [fromDate, setFromDate] = useState<ParsedDate | null>(null);
    const {value: fromValue, setValue: setFromValue} = useFilterQuery("from_" + columnId, (value) => {
        const date = parseDate(value);
        console.log(date)
        setFromError(false);
        setFromDate(date)

    }, () => {
        setFromDate(null);
    }, [], (value) => {
        const date = parseDate(value);
        console.log(date)

        if (date === null) {
            if (value.trim() != "") setFromError(true);
            return true
        }
        return false
    })

    const [toError, setToError] = useState(false)
    const [toDate, setToDate] = useState<ParsedDate | null>(null);
    const {value: toValue, setValue: setToValue} = useFilterQuery("to_" + columnId, (value) => {
        const date = parseDate(value);
        setToError(false);
        setToDate(date)
    }, () => {
        setToDate(null);
    }, [], (value) => {
        const date = parseDate(value);
        if (date === null) {
            if (value.trim() != "") setToError(true);
            return true
        }
        return false
    })

    useEffect(() => {
        column.setFilterValue({from: fromDate, to: toDate})
    }, [fromDate, toDate])


    return <Space.Compact>
        <Input placeholder={"От"} status={fromError ? "error" : ""} value={fromValue}
               onChange={(e) => setFromValue(e.currentTarget.value)}/>

        <Button style={{pointerEvents: 'none'}} icon={<MinusOutlined/>}></Button>
        <Input placeholder={"До"} status={toError ? "error" : ""} value={toValue}
               onChange={(e) => setToValue(e.currentTarget.value)}/>
    </Space.Compact>
}

