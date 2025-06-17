import { CompositeTypes, Tables } from "@/utils/supabase/gen-types";

export type FormattedBasicView = Tables<"basic_view"> & {size?: number};

// Тип для query фильтров по коллекции
export interface FormattedBasicViewFilters{
    id?:string,
    collect_id?:string,
    order?:string,
    family?:string,
    genus?:string,
    kind?:string,
    from_date?:string,
    to_date?:string,
    sex?: string,
    age?: string,
    country?:string
    region?:string
    voucher?: string,
    comment?: string,
    geocomment?:string
}

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

