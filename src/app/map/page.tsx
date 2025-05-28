"use client"

import React from 'react';
import CollectionMap from '@/app/components/map/CollectionMap';

/**
 * Страница полноэкранной карты коллекции
 */
const MapPage = () => {
    return (
        <CollectionMap
            height="100vh"
            fullScreen={true}
        />
    );
};

export default MapPage;