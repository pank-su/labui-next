"use client"

import {LocationRow} from "../../(general)/models";
import {LocationDialog} from "./location-dialog";
import Expandable from "../expandable";

interface LocationCellProps {
    locationRow: LocationRow;
    value: string | null;
    countries: { id: number, name: string | null }[];
    regions: { id: number, name: string | null }[];
    isEditing: boolean;
    isLoading: boolean;
    onEdit: (row: LocationRow) => void;
    onSave?: (countryName: string | null, regionName: string | null) => void;
    onCancel?: () => void;
    latitude?: number | null;
    longitude?: number | null;
}

export const LocationCell: React.FC<LocationCellProps> = ({
    locationRow,
    value,
    countries,
    regions,
    isEditing,
    onEdit,
    isLoading,
    onSave,
    onCancel,
    latitude,
    longitude
}) => {
    const hasCoordinates = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;

    const startEditing = () => {
        if (!hasCoordinates) {
            onEdit(locationRow);
        }
    };

    const handleDialogSave = (countryName: string | null, regionName: string | null) => {
        if (onSave) {
            onSave(countryName, regionName);
        }
    };

    const handleDialogCancel = () => {
        onCancel?.();
    };




    return (
        <>
            <Expandable 
                onDoubleClick={hasCoordinates ? undefined : (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startEditing();
                }}
                isEditable={!hasCoordinates}
            >
                <div className="min-h-[20px] w-full">
                    {(value && value.trim() !== '') ? value : ' '}
                </div>
            </Expandable>
            <LocationDialog
                visible={isEditing}
                locationRow={locationRow}
                countries={countries}
                regions={regions}
                onSave={handleDialogSave}
                onCancel={handleDialogCancel}
                isLoading={isLoading}
            />
        </>
    );
};