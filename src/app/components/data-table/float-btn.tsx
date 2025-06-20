import {FloatButton} from "antd";
import {AnimatePresence, motion} from "framer-motion";
import {VerticalAlignBottomOutlined, VerticalAlignTopOutlined} from "@ant-design/icons";

/**
 * Анимированная кнопка для спуска вниз или вверх
 */
interface AnimatedFloatButtonProps {
    rows: any[];
    scrollPosition: number;
    rowVirtualizer: {
        scrollToIndex: (index: number) => void;
    };
}

export const AnimatedFloatButton: React.FC<AnimatedFloatButtonProps> = ({
                                                                            rows,
                                                                            scrollPosition,
                                                                            rowVirtualizer,
                                                                        }) => {
    const isBottom = scrollPosition < rows.length / 2;

    return (
        <AnimatePresence>
            {rows.length > 30 && (
                <motion.div
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    exit={{opacity: 0, scale: 0.8}}
                    transition={{duration: 0.3}}
                    style={{position: "fixed", bottom: 20, right: 20}}
                >
                    <FloatButton
                        icon={
                            <motion.div
                                key={isBottom ? "down" : "up"}
                                initial={{rotate: -90, opacity: 0}}
                                animate={{rotate: 0, opacity: 1}}
                                exit={{rotate: 90, opacity: 0}}
                                transition={{duration: 0.3}}
                            >
                                {isBottom ? <VerticalAlignBottomOutlined/> : <VerticalAlignTopOutlined/>}
                            </motion.div>
                        }
                        onClick={() => {
                            if (isBottom) {
                                rowVirtualizer.scrollToIndex(rows.length - 1);
                            } else {
                                rowVirtualizer.scrollToIndex(0);
                            }
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};