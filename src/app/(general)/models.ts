import { CompositeTypes, Tables } from "@/utils/supabase/gen-types";

export type FormattedBasicView = Tables<"basic_view"> 

export function toGenomRow(view: FormattedBasicView): GenomRow {
    return {
        rowId: view.id,
        order: view.order,
        family: view.family,
        genus: view.genus,
        kind: view.kind
    }
}

export type Topology = CompositeTypes<"topology_type">
export interface GenomRow {
    rowId: number | null,
    order?: Topology | null,
    family?: Topology | null,
    genus? :Topology | null,
    kind?: Topology | null
}

// Режимы отображения страницы
enum ViewMode {
    TABLE_ONLY, // Только таблица
    MAP_ONLY,   // Только карта
    SPLIT       // Разделенный режим (таблица + карта)
}
