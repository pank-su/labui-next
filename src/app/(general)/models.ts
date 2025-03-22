import { Tables } from "@/utils/supabase/gen-types";

export type FormattedBasicView = Tables<"basic_view"> 

export interface GenomRow {
    rowId: number,
    order?: string | null,
    family?: string | null,
    genus? : string | null,
    kind?: string | null
}