import CollectionTable from "@/app/(general)/table/table";


// Страница с таблицей коллекции
export default async function Page({
                                       searchParams,
                                   }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const params = (await searchParams)

    return <CollectionTable
        params={params}/>

}

