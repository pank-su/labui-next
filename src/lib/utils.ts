import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

/**
 * Объединение классов для tailwind css (shadcn ui)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
