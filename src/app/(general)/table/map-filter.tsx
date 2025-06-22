"use client"

import React, { useCallback, useMemo, useRef, useState } from "react"
import { Map, Marker, NavigationControl, Popup } from "react-map-gl/maplibre"
import {Button, Card, Empty, List, Spin, Typography} from "antd"
import {GeoBasicView} from "@/app/(general)/models"
import { useRouter } from "next/navigation"
import useSupercluster from "use-supercluster"
import "maplibre-gl/dist/maplibre-gl.css"

const { Text } = Typography

interface CollectionMapProps {
    height?: string
    onBoundsChange?: (bounds: [number, number, number, number]) => void
    items: GeoBasicView[]
    isLoading?: boolean
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
                                                            items,
                                                            isLoading = false
                                                        }) => {
    const router = useRouter()
    const mapRef = useRef<any>(null)

    // Добавляем debounce для onBoundsChange
    const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [pointItems, setPointItems] = useState<{
        items: GeoBasicView[]
        longitude: number
        latitude: number
    } | null>(null)
    const [bounds, setBounds] = useState<
        [number, number, number, number] | undefined
    >(undefined)
    const [zoom, setZoom] = useState(3)

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

        // Debounce для onBoundsChange
        if (onBoundsChange) {
            if (boundsChangeTimeoutRef.current) {
                clearTimeout(boundsChangeTimeoutRef.current)
            }
            boundsChangeTimeoutRef.current = setTimeout(() => {
                onBoundsChange(newBounds)
            }, 300)
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

    const handleMarkerClick = useCallback((item: GeoBasicView) => {
        setPointItems({
            items: [item],
            longitude: item.longitude!,
            latitude: item.latitude!,
        })
    }, [])

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

    const formatTaxonomy = (item: GeoBasicView) => {
        const parts = []
        if (item.order?.name) parts.push(item.order.name)
        if (item.family?.name) parts.push(item.family.name)
        if (item.genus?.name) parts.push(item.genus.name)
        if (item.kind?.name) parts.push(item.kind.name)
        return parts.join(" > ")
    }

    const formatAdditionalInfo = (item: GeoBasicView) => {
        const parts = []
        if (item.sex) parts.push(`Пол: ${item.sex}`)
        if (item.age) parts.push(`Возраст: ${item.age}`)
        return parts.join(", ")
    }

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

                {memoizedClusters.map((clusterData) => (
                    <Marker
                        key={clusterData.key}
                        longitude={clusterData.longitude}
                        latitude={clusterData.latitude}
                        onClick={() => {
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