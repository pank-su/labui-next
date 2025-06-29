"use client"

import {useClient} from "@/utils/supabase/client";
import {FormattedBasicView} from "../(general)/models";
import {Database} from "@/utils/supabase/gen-types";

/**
 * Страница полноэкранной карты коллекции
 */
export default function Map() {

    const supabase = useClient()

    // Получаем данные коллекции с широтой и долготой
    // const {data: items, isPending, isError} = useQuery(
    //     getPositions(supabase)
    // );

    const isPending = false;
    const items: {
        age: string | null;
        collect_id: string | null;
        collectors: Database["public"]["CompositeTypes"]["collector_type"][] | null;
        comment: string | null;
        country: string | null;
        day: number | null;
        family: Database["public"]["CompositeTypes"]["topology_type"] | null;
        genus: Database["public"]["CompositeTypes"]["topology_type"] | null;
        geo_comment: string | null;
        id: number | null;
        kind: Database["public"]["CompositeTypes"]["topology_type"] | null;
        latitude: number | null;
        longitude: number | null;
        month: number | null;
        order: Database["public"]["CompositeTypes"]["topology_type"] | null;
        region: string | null;
        sex: string | null;
        tags: Database["public"]["CompositeTypes"]["tag_type"][] | null;
        voucher_id: string | null;
        voucher_institute: string | null;
        year: number | null;
    }[] = []


    return (
        <></>
    );
}
