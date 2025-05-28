"use client"

import React, { useCallback, useMemo, useRef, useState } from "react"
import { Map, Marker, NavigationControl, Popup } from "react-map-gl/maplibre"
import {Button, Card, Empty, List, Spin, Typography} from "antd"
import { FormattedBasicView } from "@/app/(general)/models"
import { useRouter } from "next/navigation"
import useSupercluster from "use-supercluster"
import "maplibre-gl/dist/maplibre-gl.css"

const { Text } = Typography

interface CollectionMapProps {
    height?: string
    onBoundsChange?: (bounds: [number, number, number, number]) => void
    items: FormattedBasicView[] // Элементы для отображения (обязательный)
    isLoading?: boolean
}

interface PointFeature {
    type: "Feature"
    properties: {
        cluster?: boolean
        itemId: number
        item: FormattedBasicView
    }
    geometry: {
        type: "Point"
        coordinates: [number, number]
    }
}

/**
 * Компонент для отображения элементов коллекции на карте
 * с поддержкой кластеризации близких элементов.
 * Данные передаются через items.
 */
const CollectionMap: React.FC<CollectionMapProps> = ({
                                                         height = "600px",
                                                         onBoundsChange,
                                                         items,
                                                         isLoading = false
                                                     }) => {
    const router = useRouter() // Оставлен, может пригодиться для действий в попапах
    const mapRef = useRef<any>(null)

    const [popupInfo, setPopupInfo] = useState<FormattedBasicView | null>(null)
    const [pointItems, setPointItems] = useState<{
        items: FormattedBasicView[]
        longitude: number
        latitude: number
    } | null>(null)
    const [bounds, setBounds] = useState<
        [number, number, number, number] | undefined
    >(undefined)
    const [zoom, setZoom] = useState(3)

    // Используем переданные элементы
    const data = useMemo(() => {
        return items || []
    }, [items])

    const onMapMoveEnd = useCallback(() => {
        if (!mapRef.current) return

        const map = mapRef.current.getMap()
        const newBounds = map.getBounds().toArray().flat() as [
            number,
            number,
            number,
            number,
        ]
        setBounds(newBounds)
        setZoom(map.getZoom())

        if (onBoundsChange) {
            onBoundsChange(newBounds)
        }
    }, [onBoundsChange])

    const initialViewState = useMemo(() => {
        return {
            longitude:
                data && data.length > 0 && data[0].longitude ? data[0].longitude : 37.6,
            latitude:
                data && data.length > 0 && data[0].latitude ? data[0].latitude : 55.7,
            zoom: 3,
        }
    }, [data])

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

    const { clusters, supercluster } = useSupercluster({
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
            if (!supercluster) return

            const clusterPoints = supercluster.getLeaves(clusterId, Infinity)
            const sameLocation = clusterPoints.every((point, _, arr) => {
                const [lng1, lat1] = point.geometry.coordinates
                const [lng2, lat2] = arr[0].geometry.coordinates
                return Math.abs(lng1 - lng2) < 0.0001 && Math.abs(lat1 - lat2) < 0.0001
            })

            if (sameLocation && clusterPoints.length > 1) {
                const itemsInCluster = clusterPoints.map(
                    (point) => point.properties.item,
                )
                setPointItems({
                    items: itemsInCluster,
                    longitude,
                    latitude,
                })
                setPopupInfo(null)
            } else {
                const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(clusterId) || 0,
                    20,
                )
                mapRef.current?.getMap().flyTo({
                    center: [longitude, latitude],
                    zoom: expansionZoom,
                    speed: 1.5,
                })
                setPointItems(null)
            }
        },
        [supercluster],
    )

    const handleMarkerClick = useCallback((item: FormattedBasicView) => {
        setPopupInfo(item)
        setPointItems(null)
    }, [])

    if (isLoading){
        return <div
            className="flex justify-center items-center"
            style={{ height }}
        >
            <Spin />
        </div>
    }

    if (!isLoading && (!data || data.length === 0) ) {
        return (
            <div
                className="flex justify-center items-center"
                style={{ height }}
            >
                <Empty description="Нет элементов для отображения" />
            </div>
        )
    }

    const pointsWithCoordinates = data.filter(
        (item) => item.latitude && item.longitude,
    )

    if (pointsWithCoordinates.length === 0) {
        return (
            <div
                className="flex justify-center items-center"
                style={{ height }}
            >
                <Empty description="Нет элементов с геоданными для отображения" />
            </div>
        )
    }

    const formatTaxonomy = (item: FormattedBasicView) => {
        const parts = []
        if (item.order?.name) parts.push(item.order.name)
        if (item.family?.name) parts.push(item.family.name)
        if (item.genus?.name) parts.push(item.genus.name)
        if (item.kind?.name) parts.push(item.kind.name)
        return parts.join(" > ")
    }

    const formatLocation = (item: FormattedBasicView) => {
        const parts = []
        if (item.country) parts.push(item.country)
        if (item.region) parts.push(item.region)
        return parts.join(", ")
    }

    // const openItemDetails = (id: number) => { // Если понадобится кнопка в попапе
    //     router.push(`/collection/${id}`);
    // };

    return (
        <div style={{ height, width: "100%" }}>
            <Map
                ref={mapRef}
                onRender={onMapMoveEnd}
                initialViewState={initialViewState}
                mapStyle="https://api.maptiler.com/maps/019615fe-ff46-7b99-a1b5-53f413c455dc/style.json?key=bWMAD0ONYiA5u4kpUJlf"
                style={{ width: "100%", height: "100%" }}
                onMoveEnd={onMapMoveEnd}
                attributionControl={false}
                renderWorldCopies={true}
                maxZoom={16}
            >
                <NavigationControl position="top-right" />

                {clusters.map((cluster) => {
                    const [longitude, latitude] = cluster.geometry.coordinates
                    const properties = cluster.properties
                    const isCluster = properties.cluster
                    const pointCount = isCluster ? (properties as any).point_count : 1
                    const size =
                        Math.min((pointCount / points.length) * 100, 40) + 20

                    return (
                        <Marker
                            key={`cluster-${(cluster as any).id || Math.random()}`}
                            longitude={longitude}
                            latitude={latitude}
                            onClick={() => {
                                if (isCluster) {
                                    handleClusterClick(
                                        (cluster as any).id,
                                        longitude,
                                        latitude,
                                    )
                                } else {
                                    handleMarkerClick(properties.item)
                                }
                            }}
                        >
                            <div
                                className="flex items-center justify-center rounded-full text-white font-semibold cursor-pointer"
                                style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    backgroundColor: "#1890ff",
                                    border: "2px solid white",
                                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                }}
                            >
                                {pointCount}
                            </div>
                        </Marker>
                    )
                })}

                {popupInfo && (
                    <Popup
                        longitude={popupInfo.longitude!}
                        latitude={popupInfo.latitude!}
                        anchor="bottom"
                        closeOnClick={false}
                        onClose={() => setPopupInfo(null)}
                        maxWidth="300px"
                    >
                        <div className="p-2">
                            <div className="font-bold text-lg">ID: {popupInfo.id}</div>
                            <div className="text-sm">{formatTaxonomy(popupInfo)}</div>
                            <div className="text-sm text-gray-600">
                                {formatLocation(popupInfo)}
                            </div>
                            <div className="mt-2">
                <span className="text-xs text-gray-500">
                  {popupInfo.latitude}, {popupInfo.longitude}
                </span>
                            </div>
                            {/* Пример кнопки для перехода, если понадобится */}
                            {/* <Button size="small" onClick={() => openItemDetails(popupInfo.id!)} className="mt-2">
                                Детали
                            </Button> */}
                        </div>
                    </Popup>
                )}

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
                            style={{ maxHeight: "400px", overflow: "auto" }}
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
                                                {/* Пример кнопки для перехода, если понадобится */}
                                                {/* <Button type="link" size="small" onClick={() => openItemDetails(item.id!)}>
                                                    Детали
                                                </Button> */}
                                            </div>
                                            <div className="text-sm">{formatTaxonomy(item)}</div>
                                            <div className="text-xs text-gray-500">
                                                {formatLocation(item)}
                                            </div>
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
    )
}

export default CollectionMap
