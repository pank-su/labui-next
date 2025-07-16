import { Suspense } from "react";
import TagsTable from "./table/tags-table";

export default async function Tags({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    
    return (
        <Suspense>
            <TagsTable params={params} />
        </Suspense>
    );
}