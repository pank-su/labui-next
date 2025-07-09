import {CompositeTypes, Database, Tables} from "@/utils/supabase/gen-types";
import GeoFilter from "@/app/components/data-table/filters/geo-filter";

export type FormattedBasicView = Omit<Tables<"basic_view">, "collector_ids" | "tag_ids" | "edit_user_ids"> & {size?: number};

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
export type FormattedBasicViewFilters = {
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
    tags?:string,
    collectors?:string,
    sort_field?: string,
    sort_direction?: 'asc' | 'desc',

    q?: string,
}

export interface GeoFilters {
    from_lng: number | string;
    from_lat: number | string;
    to_lng: number | string;
    to_lat: number | string;
    zoom: number | string;
    map: MapState
}

// Вспомогательная функция для проверки является ли объект GeoFilters
export function isGeoFilters(obj: any): obj is GeoFilters {
    return (
        obj &&
        typeof obj === 'object' &&
        obj.from_lng !== undefined &&
        obj.from_lat !== undefined &&
        obj.to_lng !== undefined &&
        obj.to_lat !== undefined &&
        obj.zoom !== undefined &&
        obj.map !== undefined &&
        !isNaN(Number(obj.from_lng)) &&
        !isNaN(Number(obj.from_lat)) &&
        !isNaN(Number(obj.to_lng)) &&
        !isNaN(Number(obj.to_lat)) &&
        !isNaN(Number(obj.zoom)) &&
        mapStates.includes(obj.map as MapState)
    );
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

export function toCoordinateRow(view: FormattedBasicView): CoordinateRow {
    return {
        rowId: view.id,
        latitude: view.latitude,
        longitude: view.longitude
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

export interface CoordinateRow {
    rowId: number | null,
    latitude?: number | null,
    longitude?: number | null
}

export const mapStates = ["closed", "open", "select"] as const;
export type MapState = typeof mapStates[number];