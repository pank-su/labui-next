"use client"

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Map, Marker, NavigationControl, Popup} from "react-map-gl/maplibre"
import {Button, Card, Empty, List, Spin, Typography} from "antd"
import {GeoBasicView} from "@/app/(general)/models"
import useSupercluster from "use-supercluster"
import "maplibre-gl/dist/maplibre-gl.css"

const {Text} = Typography

interface CollectionMapProps {
    height?: string
    onBoundsChange?: (bounds: [number, number, number, number], zoom: number) => void
    onZoomChange?: (zoom: number) => void
    startBounds?: [number, number, number, number]
    startZoom?: number
    items: GeoBasicView[]
    isLoading?: boolean,
    selectionMode?: boolean
    onPointSelect?: (longitude: number, latitude: number) => void
    selectedPoint?: { longitude: number | null, latitude: number | null }
}

interface PointFeature {
    type: "Feature"
    properties: {
        cluster?: boolean
        itemId: number
        item: GeoBasicView
    }
    geometry: {
        type: "Point"
        coordinates: [number, number]
    }
}

export const MapFilter: React.FC<CollectionMapProps> = ({
                                                            height = "600px",
                                                            onBoundsChange,
                                                            startBounds,
                                                            items,
                                                            isLoading = false,
                                                            startZoom = 3,
                                                            selectionMode = false,
                                                            onPointSelect,
                                                            selectedPoint
                                                        }) => {
    const mapRef = useRef<any>(null)
    const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isInitialized = useRef(false)

    // Состояние карты
    const [viewState, setViewState] = useState(() => {
        if (startBounds) {
            const [fromLng, fromLat, toLng, toLat] = startBounds
            return {
                longitude: (fromLng + toLng) / 2,
                latitude: (fromLat + toLat) / 2,
                zoom: startZoom,
            }
        }

        // Используем только первый элемент или дефолтные значения
        const firstItem = items?.[0]
        return {
            longitude: firstItem?.longitude ?? 37.6,
            latitude: firstItem?.latitude ?? 55.7,
            zoom: startZoom,
        }
    })

    const [pointItems, setPointItems] = useState<{
        items: GeoBasicView[]
        longitude: number
        latitude: number
    } | null>(null)

    const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(() => {
        if (startBounds) {
            return startBounds
        }

        // Вычисляем примерные границы на основе viewState
        const { longitude, latitude, zoom } = viewState

        // Формула для вычисления примерного offset на основе zoom
        const latOffset = 180 / Math.pow(2, zoom)
        const lngOffset = 360 / Math.pow(2, zoom)

        return [
            longitude - lngOffset,
            latitude - latOffset,
            longitude + lngOffset,
            latitude + latOffset
        ]
    })
    const [zoom, setZoom] = useState(startZoom)

    const data = useMemo(() => {
        return items || []
    }, [items])

    // Обновляем viewState только при первой инициализации или когда startBounds изменяется существенно
    useEffect(() => {
        if (!isInitialized.current && startBounds) {
            const [fromLng, fromLat, toLng, toLat] = startBounds
            setViewState({
                longitude: (fromLng + toLng) / 2,
                latitude: (fromLat + toLat) / 2,
                zoom: startZoom,
            })
            isInitialized.current = true
        }
    }, [startBounds, startZoom])

    const onMapMove = useCallback((evt: any) => {
        setViewState(evt.viewState)
    }, [])

    const onMapMoveEnd = useCallback(() => {
        if (!mapRef.current) return

        const map = mapRef.current.getMap()
        const newBounds = map.getBounds().toArray().flat() as [
            number,
            number,
            number,
            number,
        ]
        const newZoom = map.getZoom()

        setBounds(newBounds)
        setZoom(newZoom)

        // Debounce для onBoundsChange
        if (onBoundsChange) {
            if (boundsChangeTimeoutRef.current) {
                clearTimeout(boundsChangeTimeoutRef.current)
            }
            boundsChangeTimeoutRef.current = setTimeout(() => {
                onBoundsChange(newBounds, newZoom)
            }, 300)
        }
    }, [onBoundsChange])

    const points = useMemo(() => {
        if (!data) return []

        return data
            .filter((item) => item.latitude && item.longitude)
            .map((item) => ({
                type: "Feature",
                properties: {
                    itemId: item.id!,
                    item: item,
                },
                geometry: {
                    type: "Point",
                    coordinates: [item.longitude!, item.latitude!],
                },
            })) as PointFeature[]
    }, [data])

    const {clusters, supercluster} = useSupercluster({
        points,
        bounds,
        zoom,
        options: {
            radius: 75,
            maxZoom: 20,
            minPoints: 2,
        },
    })

    const handleClusterClick = useCallback(
        (clusterId: number, longitude: number, latitude: number) => {
            if (!supercluster || !mapRef.current) return

            const clusterPoints = supercluster.getLeaves(clusterId, Infinity)
            const sameLocation = clusterPoints.every((point, _, arr) => {
                const [lng1, lat1] = point.geometry.coordinates
                const [lng2, lat2] = arr[0].geometry.coordinates
                return Math.abs(lng1 - lng2) < 0.0001 && Math.abs(lat1 - lat2) < 0.0001
            })

            if (sameLocation && clusterPoints.length > 1) {
                // Если точки в одном месте, показываем popup
                const itemsInCluster = clusterPoints.map(
                    (point) => point.properties.item,
                )
                setPointItems({
                    items: itemsInCluster,
                    longitude,
                    latitude,
                })
                
                // В режиме выбора также устанавливаем координаты в это место
                if (selectionMode && onPointSelect) {
                    onPointSelect(longitude, latitude)
                }
            } else {
                // Если точки разбросаны, приближаемся
                const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(clusterId) || 0,
                    20,
                )

                // Используем flyTo для плавного перехода
                const map = mapRef.current.getMap()
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: expansionZoom,
                    duration: 1000 // Длительность анимации в миллисекундах
                })

                setPointItems(null)
            }
        },
        [supercluster, selectionMode, onPointSelect],
    )

    const handleMarkerClick = useCallback((item: GeoBasicView) => {
        // Всегда показываем popup с информацией о точке
        setPointItems({
            items: [item],
            longitude: item.longitude!,
            latitude: item.latitude!,
        })
        
        // В режиме выбора также устанавливаем координаты в это место
        if (selectionMode && onPointSelect) {
            onPointSelect(item.longitude!, item.latitude!)
        }
    }, [selectionMode, onPointSelect])

    const handleMapClick = useCallback((event: any) => {
        if (selectionMode && onPointSelect) {
            const {lngLat} = event
            onPointSelect(lngLat.lng, lngLat.lat)
        }
    }, [selectionMode, onPointSelect])

    // Мемоизируем кластеры для предотвращения мигания
    const memoizedClusters = useMemo(() => {
        return clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates
            const properties = cluster.properties
            const isCluster = properties.cluster
            const pointCount = isCluster ? (properties as any).point_count : 1
            const size = Math.min((pointCount / points.length) * 100, 40) + 20

            // Используем стабильный ключ
            const key = isCluster
                ? `cluster-${(cluster as any).id}`
                : `point-${properties.itemId}`

            return {
                key,
                longitude,
                latitude,
                isCluster,
                pointCount,
                size,
                clusterId: (cluster as any).id,
                item: properties.item
            }
        })
    }, [clusters, points.length])

    // Вспомогательные функции
    const formatTaxonomy = useCallback((item: GeoBasicView) => {
        const parts = []
        if (item.order?.name) parts.push(item.order.name)
        if (item.family?.name) parts.push(item.family.name)
        if (item.genus?.name) parts.push(item.genus.name)
        if (item.kind?.name) parts.push(item.kind.name)
        return parts.join(" > ")
    }, [])

    const formatAdditionalInfo = useCallback((item: GeoBasicView) => {
        const parts = []
        if (item.sex) parts.push(`Пол: ${item.sex}`)
        if (item.age) parts.push(`Возраст: ${item.age}`)
        return parts.join(", ")
    }, [])


    // Вычисляем производные значения
    const pointsWithCoordinates = useMemo(() =>
            data.filter((item) => item.latitude && item.longitude),
        [data]
    )

    // РЕНДЕРИНГ
    if (isLoading) {
        return (
            <div className="flex justify-center items-center" style={{height}}>
                <Spin/>
            </div>
        )
    }

    if (!isLoading && (!data || data.length === 0)) {
        return (
            <div className="flex justify-center items-center" style={{height}}>
                <Empty description="Нет элементов для отображения"/>
            </div>
        )
    }

    if (pointsWithCoordinates.length === 0 && !selectionMode) {
        return (
            <div className="flex justify-center items-center" style={{height}}>
                <Empty description="Нет элементов с геоданными для отображения"/>
            </div>
        )
    }

    return (
        <div style={{height, width: "100%"}}>
            <Map
                ref={mapRef}
                {...viewState}
                onMove={onMapMove}
                onMoveEnd={onMapMoveEnd}
                onClick={handleMapClick}
                mapStyle="https://api.maptiler.com/maps/019615fe-ff46-7b99-a1b5-53f413c455dc/style.json?key=bWMAD0ONYiA5u4kpUJlf"
                style={{width: "100%", height: "100%", cursor: selectionMode ? "crosshair" : "default"}}
                attributionControl={false}
                renderWorldCopies={true}
                maxZoom={16}
                reuseMaps={true}
            >
                <NavigationControl position="top-right"/>

                {memoizedClusters.map((clusterData) => (
                    <Marker
                        key={clusterData.key}
                        longitude={clusterData.longitude}
                        latitude={clusterData.latitude}
                        onClick={(e) => {
                            e.originalEvent.stopPropagation(); // Предотвращаем всплытие события
                            if (clusterData.isCluster) {
                                handleClusterClick(
                                    clusterData.clusterId,
                                    clusterData.longitude,
                                    clusterData.latitude,
                                )
                            } else {
                                handleMarkerClick(clusterData.item)
                            }
                        }}
                    >
                        <div
                            className="flex items-center justify-center rounded-full text-white font-semibold cursor-pointer"
                            style={{
                                width: `${clusterData.size}px`,
                                height: `${clusterData.size}px`,
                                backgroundColor: "#1890ff",
                                border: "2px solid white",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                            }}
                        >
                            {clusterData.pointCount}
                        </div>
                    </Marker>
                ))}

                {/* Выбранная точка в режиме редактирования */}
                {selectedPoint && selectedPoint.longitude !== null && selectedPoint.latitude !== null && (
                    <Marker
                        longitude={selectedPoint.longitude}
                        latitude={selectedPoint.latitude}
                        style={{ zIndex: 1000 }}
                    >
                        <div
                            className="flex items-center justify-center rounded-full text-white font-semibold"
                            style={{
                                width: "20px",
                                height: "20px",
                                backgroundColor: "#ff4d4f",
                                border: "3px solid white",
                                boxShadow: "0 2px 8px rgba(255,77,79,0.5)",
                                zIndex: 1000,
                                position: "relative"
                            }}
                        >
                            ✓
                        </div>
                    </Marker>
                )}

                {pointItems && (
                    <Popup
                        longitude={pointItems.longitude}
                        latitude={pointItems.latitude}
                        anchor="bottom"
                        closeOnClick={false}
                        onClose={() => setPointItems(null)}
                        closeButton={false}
                        maxWidth="350px"
                    >
                        <Card
                            title={pointItems.items.length === 1
                                ? `Элемент`
                                : `Элементы в точке (${pointItems.items.length})`}
                            size="small"
                            style={{maxHeight: "400px", overflow: "auto"}}
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
                                            <div className="text-sm mb-1">{formatTaxonomy(item)}</div>
                                            {formatAdditionalInfo(item) && (
                                                <div className="text-xs text-gray-600">
                                                    {formatAdditionalInfo(item)}
                                                </div>
                                            )}
                                        </div>
                                    </List.Item>
                                )}
                                itemLayout="vertical"
                                size="small"
                                bordered={false}
                                split={pointItems.items.length > 1}
                            />
                        </Card>
                    </Popup>
                )}
            </Map>
        </div>
    )
}