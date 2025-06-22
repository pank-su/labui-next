import {CompositeTypes, Database, Tables} from "@/utils/supabase/gen-types";

export type FormattedBasicView = Tables<"basic_view"> & {size?: number};

export interface GeoBasicView {
    id: number;
    collect_id?: string;
    order?: Database["public"]["CompositeTypes"]["topology_type"]
    family?: Database["public"]["CompositeTypes"]["topology_type"]
    genus?: Database["public"]["CompositeTypes"]["topology_type"]
    kind?: Database["public"]["CompositeTypes"]["topology_type"]
    sex?: string,
    age?: string
    latitude: number
    longitude: number
}

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
    geo_comment?:string,
    voucher_id?:string,


    q?: string,
}

export interface GeoFilters{
    from_lng: number,
    from_lat: number,
    to_lng: number,
    to_lat: number,
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

