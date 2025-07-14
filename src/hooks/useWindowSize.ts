"use client"

import {useEffect, useState} from 'react';

type Size = {
    width: number,
    height: number
}

/**
 * Получение текущего размера окна
 */
function useWindowSize() {
    // Инициализируем состояние безопасными значениями.
    // Можно выбрать другие значения по умолчанию, например, null.
    const [windowSize, setWindowSize] = useState<Size>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        // Функция для обновления размера окна
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Добавляем слушатель события resize
        window.addEventListener('resize', handleResize);

        // Обновляем размеры сразу после монтирования компонента
        handleResize();

        // Убираем слушатель при размонтировании компонента
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
}

export default useWindowSize;


