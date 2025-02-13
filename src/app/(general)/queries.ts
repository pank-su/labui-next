import { SupabaseClient } from "@supabase/supabase-js";
import { FormattedBasicView } from "./models";
import { TypedSupabaseClient } from "@/src/utils/supabase/typed";
import { badDateToDate } from "@/src/utils/formatDate";
import dayjs, { Dayjs } from "dayjs";

/**
 * Добавляет ключ к объекту
 * @param obj Объект
 * @returns Объект с ключом
 */
async function formatCollection<T extends { id: number | null, day: number | null, month: number | null, year: number | null }>(obj: T): Promise<T & { key: number | null, date: Dayjs | null }> {
    const date = badDateToDate(obj.year, obj.month, obj.day)
    return {
        ...obj,
        key: obj.id,
        date: date != null ? dayjs(date) : null
    };
};


export async function getCollection(client: TypedSupabaseClient): Promise<FormattedBasicView[]> {
    const { data } = (await client.from("basic_view").select())
    return (await Promise.all((data ?? []).map((row) => formatCollection(row))))
}