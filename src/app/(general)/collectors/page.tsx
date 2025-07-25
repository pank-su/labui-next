import { Suspense } from "react";
import CollectorsTable from "./table/collectors-table";

export default async function Collectors({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    
    return (
        <Suspense>
            <CollectorsTable params={params} />
        </Suspense>
    );
}