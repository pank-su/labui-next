import { Table } from "antd"
import { createClient } from "../utils/supabase/client"

const addKey = <T extends {id: number | null }>(obj: T): T & {key: number | null} => {
    return Object.defineProperty(obj, "key", {
        get() {
            return this.id
        },
        enumerable: true,
        configurable: false
    }) as T & {key: number|null};
};




async function loadCollection() {
    const supabase = createClient()
    const {data} = (await supabase.from("basic_view").select())

    const newData = data?.map((row) => addKey(row))

    const columns = Object.keys(data?.at(0)!)
    
   

    
    
    return  <Table dataSource={newData} pagination={false}>

    </Table>
}


/**
 * Страница коллекции
 * 
 */
export default async function Page() {
    return await loadCollection()
}

