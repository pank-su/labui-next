"use client"

import {LocationRow} from "../../(general)/models";
import {useState} from "react";
import {LocationDialog} from "./location-dialog";

interface LocationCellProps {
    locationRow: LocationRow;
    field: 'country' | 'region';
    value: string | null;
    countries: { id: number, name: string | null }[];
    regions: { id: number, name: string | null }[];
    isEditing: boolean;
    isLoading: boolean;
    onEdit: (row: LocationRow) => void;
    onChange: (countryName: string | null, regionName: string | null) => void;
    showActions?: boolean;
    onSave?: (countryName: string | null, regionName: string | null) => void;
    onCancel?: () => void;
    latitude?: number | null;
    longitude?: number | null;
}

export const LocationCell: React.FC<LocationCellProps> = ({
    locationRow,
    field,
    value,
    countries,
    regions,
    isEditing,
    onEdit,
    isLoading,
    onChange,
    showActions = false,
    onSave,
    onCancel,
    latitude,
    longitude
}) => {
    const [isDialogVisible, setIsDialogVisible] = useState(false);

    const hasCoordinates = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;

    const startEditing = () => {
        if (!hasCoordinates) {
            onEdit(locationRow);
            setIsDialogVisible(true);
        }
    };

    const handleDialogSave = (countryName: string | null, regionName: string | null) => {
        if (onSave) {
            onSave(countryName, regionName);
        }
        setIsDialogVisible(false);
    };

    const handleDialogCancel = () => {
        setIsDialogVisible(false);
        onCancel?.();
    };




    return (
        <div
            className={`w-full ${hasCoordinates ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startEditing();
            }}
        >
            {(value && value.trim() !== '') ? value : ' '}
            <>
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
        </div>
    );
};