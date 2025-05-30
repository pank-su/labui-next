import {TypedSupabaseClient} from "@/utils/supabase/typed";
import {FormattedBasicViewFilters, FormattedBasicView} from "@/app/(general)/models";
import {parseIndexFilter} from "@/utils/parseIndexFilter";
import {queryOptions} from "@tanstack/react-query";
import {ReadonlyURLSearchParams} from "next/navigation";


export const basicView = (client: TypedSupabaseClient, params: {
    [key: string]: string | string[] | undefined
} | ReadonlyURLSearchParams) => queryOptions({
    queryKey: ["basic_view"],
    queryFn: async () => getBasicView(client, params as FormattedBasicViewFilters)
})

export async function getBasicView(client: TypedSupabaseClient, filters: FormattedBasicViewFilters | undefined = undefined) {
    let query = client.from("basic_view").select("id,collect_id,latitude,longitude,order,family,genus,kind,age,sex,voucher_institute,voucher_id,country,region,geo_comment,day,month,year,comment,collectors,tags")

    if (!filters){
        return  (await query).data;
    }

    if (filters?.collect_id){
        query = query.textSearch("collect_id", filters.collect_id)
    }



    const taxonomyFields: (keyof Pick<
        FormattedBasicViewFilters,
        "order" | "family" | "genus" | "kind"
    >)[] = ["order", "family", "genus", "kind"];
    taxonomyFields.forEach((field) => {
        if (filters[field]) {
            if (filters[field] === " ") {
                query = query.is(field + "->>name", null);
            } else {

                query = query.filter(field + "->>name", "eq", filters[field]) // 'order_name', 'family_name' etc.
            }
        }
    });

    if (filters?.id) {
        const {data} = await client.from("basic_view").select("id.max()").single()

        const ids = parseIndexFilter(filters.id as string, 1, data?.max ?? 10000);
        if (ids.length > 0) {
            query = query.in("id", ids)
        }
    }

    const res = (await query)
    console.log(res.error)
    return res.data;
}


export const orders = (client: TypedSupabaseClient) => queryOptions({
    queryKey: ["orders"],
    queryFn: async () => loadOrders(client)
})


async function loadOrders(client: TypedSupabaseClient) {
    return (await client.from("order").select("id,name").not('name', 'is', null)).data
}