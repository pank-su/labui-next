"use client"

import { useClient } from "@/utils/supabase/client";
import {getPositions} from "@/app/map/queries";
import { FormattedBasicView } from "../(general)/models";
import CollectionMap from "@/app/components/map/CollectionMap";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";

/**
 * Страница полноэкранной карты коллекции
 */
export default function Map() {

    const supabase = useClient()

    // Получаем данные коллекции с широтой и долготой
    const {data: items, isPending, isError} = useQuery(
        getPositions(supabase)
    );


    return (
        <CollectionMap
            height="100vh"

            items={items as FormattedBasicView[]}
            isLoading={isPending}
        />
    );
}
