"use client"

import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {Map, Marker, Popup, NavigationControl} from 'react-map-gl/maplibre';
import {useClient} from '@/utils/supabase/client';
import {useQuery} from '@supabase-cache-helpers/postgrest-react-query';
import {Empty, Spin, Button, Typography, List, Card} from 'antd';
import {FormattedBasicView} from '@/app/(general)/models';
import {useRouter} from 'next/navigation';
import useSupercluster from 'use-supercluster';
import 'maplibre-gl/dist/maplibre-gl.css';

const {Text} = Typography;

interface CollectionMapProps {
    height?: string;
    fullScreen?: boolean;
    showAllItems?: boolean; // Показывать все элементы или только в видимой области
    onBoundsChange?: (bounds: [number, number, number, number]) => void; // Колбэк для передачи границ карты
    filteredItems?: FormattedBasicView[]; // Отфильтрованные элементы для отображения
    simplified?: boolean; // Упрощенный режим без счетчика и с минимальным UI
}

interface PointFeature {
    type: 'Feature';
    properties: {
        cluster?: boolean;
        itemId: number;
        item: FormattedBasicView;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
}

/**
 * Компонент для отображения элементов коллекции на карте
 * с поддержкой кластеризации близких элементов
 */
const CollectionMap: React.FC<CollectionMapProps> = ({
                                                         height = '600px',
                                                         fullScreen = false,
                                                         showAllItems = true,
                                                         onBoundsChange,
                                                         filteredItems,
                                                         simplified = false
                                                     }) => {
    const supabase = useClient();
    const router = useRouter();
    const mapRef = useRef<any>(null);

    // Состояние для открытого попапа
    const [popupInfo, setPopupInfo] = useState<FormattedBasicView | null>(null);

    // Состояние для списка элементов в точке
    const [pointItems, setPointItems] = useState<{
        items: FormattedBasicView[],
        longitude: number,
        latitude: number
    } | null>(null);

    // Состояние для отслеживания границ видимой области карты
    const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(undefined);

    // Состояние для зума карты
    const [zoom, setZoom] = useState(3);

    // Получаем данные коллекции с широтой и долготой
    const {data: allData, isLoading, isError} = useQuery(
        supabase.from("basic_view")
            .select("id,collect_id,latitude,longtitude,order,family,genus,kind,country,region")
            .not('latitude', 'is', null)
            .not('longtitude', 'is', null)
    );

    // Используем либо переданные фильтрованные элементы, либо все данные
    const data = useMemo(() => {
        if (filteredItems) return filteredItems;
        return allData || [];
    }, [filteredItems, allData]);

    // Обработчик изменения масштаба или перемещения карты
    const onMapMoveEnd = useCallback(() => {
        if (!mapRef.current) return;

        const map = mapRef.current.getMap();
        const newBounds = map.getBounds().toArray().flat() as [number, number, number, number];
        setBounds(newBounds);
        setZoom(map.getZoom());

        // Вызываем колбэк с новыми границами, если он предоставлен
        if (onBoundsChange) {
            onBoundsChange(newBounds);
        }
    }, [onBoundsChange]);

    // Центрируем карту на первом элементе или на центре России
    const initialViewState = useMemo(() => {
        return {
            longitude: data && data.length > 0 && data[0].longtitude ? data[0].longtitude : 37.6,
            latitude: data && data.length > 0 && data[0].latitude ? data[0].latitude : 55.7,
            zoom: 3
        };
    }, [data]);

    // Преобразуем данные в формат GeoJSON для кластеризации
    const points = useMemo(() => {
        if (!data) return [];

        return data.filter(item => item.latitude && item.longtitude).map(item => ({
            type: 'Feature',
            properties: {
                itemId: item.id!,
                item: item
            },
            geometry: {
                type: 'Point',
                coordinates: [item.longtitude!, item.latitude!]
            }
        })) as PointFeature[];
    }, [data]);

    // Используем хук для кластеризации
    const {clusters, supercluster} = useSupercluster({
        points,
        bounds,
        zoom,
        options: {
            radius: 75, // Радиус кластеризации в пикселях
            maxZoom: 20, // Максимальный зум для кластеризации
            minPoints: 2 // Минимальное количество точек для формирования кластера
        }
    });

    // При монтировании компонента регистрируем обработчик изменений карты
    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current.getMap();
            // Инициализируем границы и зум
            const initialBounds = map.getBounds().toArray().flat() as [number, number, number, number];
            setBounds(initialBounds);
            setZoom(map.getZoom());

            // Вызываем колбэк с начальными границами, если он предоставлен
            if (onBoundsChange) {
                onBoundsChange(initialBounds);
            }
        }
    }, [mapRef, onBoundsChange]);

    // Обработка клика по кластеру
    const handleClusterClick = useCallback((clusterId: number, longitude: number, latitude: number) => {
        if (!supercluster) return;

        // Получаем точки, входящие в этот кластер
        const clusterPoints = supercluster.getLeaves(clusterId, Infinity);

        // Определяем, находятся ли все точки кластера в одной геопозиции
        const sameLocation = clusterPoints.every((point, _, arr) => {
            const [lng1, lat1] = point.geometry.coordinates;
            const [lng2, lat2] = arr[0].geometry.coordinates;

            // Используем очень маленькое значение для определения "одной точки"
            return Math.abs(lng1 - lng2) < 0.0001 && Math.abs(lat1 - lat2) < 0.0001;
        });

        if (sameLocation && clusterPoints.length > 1) {
            // Если все точки в одной геопозиции, показываем список элементов
            const items = clusterPoints.map(point => point.properties.item);
            setPointItems({
                items,
                longitude,
                latitude
            });
            setPopupInfo(null); // Закрываем другой попап, если он открыт
        } else {
            // Если точки распределены, приближаем карту для раскрытия кластера
            const expansionZoom = Math.min(
                supercluster.getClusterExpansionZoom(clusterId) || 0,
                20
            );

            mapRef.current?.getMap().flyTo({
                center: [longitude, latitude],
                zoom: expansionZoom,
                speed: 1.5
            });

            // Закрываем список элементов, если он открыт
            setPointItems(null);
        }
    }, [supercluster]);

    // Обработка клика по маркеру
    const handleMarkerClick = useCallback((item: FormattedBasicView) => {
        // Проверяем, есть ли в этой точке другие элементы
        if (!data) return;

        const itemsAtSameLocation = data.filter(dataItem =>
            dataItem.latitude === item.latitude &&
            dataItem.longtitude === item.longtitude
        );


        setPopupInfo(item);
        setPointItems(null);

    }, [data]);

    // Обработка состояния загрузки
    if (isLoading && !filteredItems) {
        return <div className="flex justify-center items-center" style={{height}}>
            <Spin size="large" tip="Загрузка карты..."/>
        </div>;
    }

    // Обработка ошибки
    if (isError && !filteredItems) {
        return <div className="flex justify-center items-center" style={{height}}>
            <Empty description="Не удалось загрузить данные для карты"/>
        </div>;
    }

    // Обработка отсутствия данных с координатами
    if ((!data || data.length === 0) && !isLoading) {
        return <div className="flex justify-center items-center" style={{height}}>
            <Empty description="Нет элементов с геоданными для отображения"/>
        </div>;
    }

    // Количество элементов с координатами
    const pointsCount = data.filter(item => item.latitude && item.longtitude).length;

    // Переход к детальной странице элемента
    const openItemDetails = (id: number) => {
        router.push(`/collection/${id}`);
    };

    // Форматирование данных таксономии для отображения
    const formatTaxonomy = (item: FormattedBasicView) => {
        const parts = [];
        if (item.order?.name) parts.push(item.order.name);
        if (item.family?.name) parts.push(item.family.name);
        if (item.genus?.name) parts.push(item.genus.name);
        if (item.kind?.name) parts.push(item.kind.name);

        return parts.join(' > ');
    };

    // Форматирование адреса
    const formatLocation = (item: FormattedBasicView) => {
        const parts = [];
        if (item.country) parts.push(item.country);
        if (item.region) parts.push(item.region);

        return parts.join(', ');
    };

    return (
        <div style={{height, width: '100%'}} className={fullScreen ? 'fixed inset-0 z-50' : ''}>
            <Map
                ref={mapRef}
                initialViewState={initialViewState}
                mapStyle="https://api.maptiler.com/maps/019615fe-ff46-7b99-a1b5-53f413c455dc/style.json?key=bWMAD0ONYiA5u4kpUJlf"
                style={{width: '100%', height: '100%'}}
                onMoveEnd={onMapMoveEnd}
                attributionControl={false}
                renderWorldCopies={true}
                maxPitch={0}
            >
                <NavigationControl position="top-right"/>

                {/* Отображение информации о количестве элементов */}
                {!simplified && (
                    <div className="absolute top-2 left-2 bg-white bg-opacity-80 p-2 rounded shadow z-10">
                        <Text>Элементов на карте: {pointsCount}</Text>
                    </div>
                )}

                {/* Рендеринг кластеров и отдельных маркеров */}
                {clusters.map(cluster => {
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    const properties = cluster.properties;
                    const isCluster = properties.cluster;
                    // Используем приведение типа для доступа к свойствам кластера
                    const pointCount = isCluster ? (properties as any).point_count : 1;

                    // Рендерим кластер
                    const size = Math.min(pointCount / points.length * 100, 40) + 20;

                    return (
                        <Marker
                            key={`cluster-${(cluster as any).id || Math.random()}`}
                            longitude={longitude}
                            latitude={latitude}
                            onClick={() => {
                                if (isCluster)
                                    handleClusterClick(
                                        // Используем приведение типа для доступа к id кластера
                                        (cluster as any).id,
                                        longitude,
                                        latitude
                                    )
                                else handleMarkerClick(properties.item)
                            }}
                        >
                            <div
                                className="flex items-center justify-center rounded-full text-white font-semibold cursor-pointer"
                                style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    backgroundColor: '#1890ff',
                                    border: '2px solid white',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}
                            >
                                {pointCount}
                            </div>
                        </Marker>
                    );

                })}

                {/* Всплывающее окно с информацией об элементе */}
                {popupInfo && (
                    <Popup
                        longitude={popupInfo.longtitude!}
                        latitude={popupInfo.latitude!}
                        anchor="bottom"
                        closeOnClick={false}
                        onClose={() => setPopupInfo(null)}
                        maxWidth="300px"
                    >
                        <div className="p-2">
                            <div className="font-bold text-lg">ID: {popupInfo.id}</div>
                            <div className="text-sm">{formatTaxonomy(popupInfo)}</div>
                            <div className="text-sm text-gray-600">{formatLocation(popupInfo)}</div>
                            <div className="mt-2">
                <span className="text-xs text-gray-500">
                  {popupInfo.latitude}, {popupInfo.longtitude}
                </span>
                            </div>

                        </div>
                    </Popup>
                )}

                {/* Всплывающее окно со списком элементов в одной точке */}
                {pointItems && (
                    <Popup
                        longitude={pointItems.longitude}
                        latitude={pointItems.latitude}
                        anchor="bottom"
                        closeOnClick={false}
                        onClose={() => setPointItems(null)}
                        maxWidth="350px"
                    >
                        <Card
                            title={`Элементы в точке (${pointItems.items.length})`}
                            size="small"
                            style={{maxHeight: '400px', overflow: 'auto'}}
                            extra={
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setPointItems(null)}
                                >
                                    Закрыть
                                </Button>
                            }
                        >
                            <List
                                dataSource={pointItems.items}
                                renderItem={(item) => (
                                    <List.Item key={item.id}>
                                        <div className="w-full">
                                            <div className="flex justify-between items-center">
                                                <Text strong>ID: {item.id}</Text>

                                            </div>
                                            <div className="text-sm">{formatTaxonomy(item)}</div>
                                            <div className="text-xs text-gray-500">{formatLocation(item)}</div>
                                        </div>
                                    </List.Item>
                                )}
                                itemLayout="vertical"
                                size="small"
                                bordered={false}
                                split={true}
                            />
                        </Card>
                    </Popup>
                )}
            </Map>
        </div>
    );
};

export default CollectionMap;