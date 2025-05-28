import {TypedSupabaseClient} from "@/utils/supabase/typed";

export function getBasicView(client: TypedSupabaseClient) {
    return client.from("basic_view").select("id,collect_id,latitude,longitude,order,family,genus,kind,age,sex,voucher_institute,voucher_id,country,region,geo_comment,day,month,year,comment,collectors,tags")
}

export function loadOrders(client: TypedSupabaseClient) {
    return client.from("order").select("id,name").not('name', 'is', null)
}