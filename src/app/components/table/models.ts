import { Tables } from "@/src/utils/supabase/gen-types";
import { Dayjs } from "dayjs";

export type FormattedBasicView = Tables<"basic_view"> & { key: number | null, date: Dayjs | null };
