import {SyncOutlined} from "@ant-design/icons";
import {Tag} from "antd";
import {useQuery} from "@tanstack/react-query";
import {useClient} from "@/utils/supabase/client";
import {nextCollectionId} from "@/app/(general)/queries";


export default function NewId() {
    const supabase = useClient();
    const { data: nextId, isLoading } = useQuery(nextCollectionId(supabase));

    if (isLoading || nextId === undefined) {
        return <Tag icon={<SyncOutlined spin/>} color="processing">
            загрузка
        </Tag>
    }

    return <Tag color="blue">
        {nextId}
    </Tag>
}