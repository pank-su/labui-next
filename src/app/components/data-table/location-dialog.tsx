"use client"

import {Button, Input, Modal, Typography, message, Spin} from "antd";
import {LocationRow} from "../../(general)/models";
import {useState, useEffect, useCallback} from "react";
import {MapPinIcon, GlobeIcon} from "lucide-react";
import {CheckOutlined} from "@ant-design/icons";

interface LocationDialogProps {
    visible: boolean;
    locationRow: LocationRow;
    countries: { id: number, name: string | null }[];
    regions: { id: number, name: string | null }[];
    onCancel: () => void;
    onSave: (countryName: string | null, regionName: string | null) => void;
    isLoading?: boolean;
}

interface NominatimPlace {
    place_id: number;
    display_name: string;
    address: {
        country?: string;
        state?: string;
        region?: string;
        county?: string;
        province?: string;
        city?: string;
        town?: string;
        village?: string;
    };
    lat: string;
    lon: string;
    type: string;
    importance: number;
}

export const LocationDialog: React.FC<LocationDialogProps> = ({
    visible,
    locationRow,
    countries,
    regions,
    onCancel,
    onSave,
    isLoading = false
}) => {
    const [locationInput, setLocationInput] = useState("");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<NominatimPlace[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [skipNextSearch, setSkipNextSearch] = useState(false);

    // Инициализация текущими значениями
    useEffect(() => {
        if (visible && locationRow) {
            setSelectedCountry(locationRow.country?.name || null);
            setSelectedRegion(locationRow.region?.name || null);
        }
    }, [visible, locationRow]);

    // Поиск локации через Nominatim с дебаунсом
    const searchLocation = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                'https://nominatim.openstreetmap.org/search?' +
                new URLSearchParams({
                    q: query,
                    format: 'json',
                    addressdetails: '1',
                    limit: '10',
                    accept_language: 'ru,en'
                })
            );
            
            if (!response.ok) {
                throw new Error('Failed to search location');
            }

            const data: NominatimPlace[] = await response.json();
            
            // Фильтруем и сортируем результаты по важности
            const filteredResults = data
                .filter(place => place.address?.country) // Только места с указанной страной
                .sort((a, b) => b.importance - a.importance)
                .slice(0, 8);

            setSearchResults(filteredResults);
            setShowResults(true);
        } catch (error) {
            console.error('Error searching location:', error);
            message.error('Ошибка поиска локации');
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Дебаунс для поиска
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (skipNextSearch) {
                setSkipNextSearch(false);
                return;
            }
            
            if (locationInput.trim()) {
                searchLocation(locationInput);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 1000); // Увеличиваем время дебаунса до 1 секунды

        return () => clearTimeout(timeoutId);
    }, [locationInput, searchLocation, skipNextSearch]);

    // Обработка выбора места из результатов поиска
    const handleLocationSelect = (place: NominatimPlace) => {
        const countryName = place.address.country;
        
        // Определяем порядок получения полей для получения "региона"
        const locationFields = [
            "state",
            "county",
            "province",
            "region",
            "city",
            "town",
            "village",
        ];

        // Получаем первую попавшуюся часть иначе пустоту
        let regionName = "";
        for (const field of locationFields) {
            if (place.address[field as keyof typeof place.address]) {
                regionName = place.address[field as keyof typeof place.address] as string;
                break;
            }
        }

        if (!countryName) {
            message.error('Не удалось определить страну для выбранного места');
            return;
        }

        // Устанавливаем флаг, чтобы пропустить следующий поиск
        setSkipNextSearch(true);
        
        // Устанавливаем названия напрямую
        setSelectedCountry(countryName);
        setSelectedRegion(regionName || null);
        setLocationInput(place.display_name);
        setShowResults(false);
    };

    // Обработка сохранения
    const handleSave = () => {
        onSave(selectedCountry, selectedRegion);
    };

    // Обработка отмены
    const handleCancel = () => {
        setLocationInput("");
        setSelectedCountry(null);
        setSelectedRegion(null);
        setSearchResults([]);
        setShowResults(false);
        onCancel();
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    <span>Редактирование местоположения</span>
                </div>
            }
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Отмена
                </Button>,
                <Button 
                    key="save" 
                    type="primary" 
                    icon={<CheckOutlined />}
                    onClick={handleSave}
                    loading={isLoading}
                >
                    Сохранить
                </Button>
            ]}
            width={600}
        >
            <div className="space-y-4">
                {/* Поле ввода локации */}
                <div>
                    <Typography.Text strong>Введите местоположение:</Typography.Text>
                    <div className="relative">
                        <Input
                            placeholder="Введите город, регион, страну..."
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            suffix={isSearching ? <Spin size="small" /> : undefined}
                            className="mt-1"
                        />
                        
                        {/* Результаты поиска */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {searchResults.map((place) => (
                                    <div
                                        key={place.place_id}
                                        className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        onClick={() => handleLocationSelect(place)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {place.display_name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {place.address.country}
                                                    {place.address.state && `, ${place.address.state}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Выбранные значения */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Typography.Text strong>Страна:</Typography.Text>
                        <div className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            {selectedCountry || 'Не определено'}
                        </div>
                    </div>

                    <div>
                        <Typography.Text strong>Регион:</Typography.Text>
                        <div className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            {selectedRegion || 'Не определено'}
                        </div>
                    </div>
                </div>

                {/* Текущие значения */}
                {(selectedCountry || selectedRegion) && (
                    <div className="p-3 bg-gray-50 rounded-md">
                        <Typography.Text strong>Текущее местоположение:</Typography.Text>
                        <div className="mt-1 flex items-center gap-2">
                            <GlobeIcon className="w-4 h-4 text-gray-400" />
                            <span>
                                {selectedCountry || 'Не выбрано'}
                                {selectedRegion && `, ${selectedRegion}`}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};