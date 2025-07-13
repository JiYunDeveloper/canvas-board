import { useRef } from "react";
import useScreenSize from "./useScreenSize";

type CacheType = {
  imageWidth: number;
  imageHeight: number;
  containerWidth: number;
  containerHeight: number;
  result: { width: number; height: number; scale: number };
};

/** 计算合适的画布尺寸 */
const useSuitableCanvasSize = (
  imageWidth: number,
  imageHeight: number,
  bottomHeight: number
) => {
  const cacheRef = useRef<CacheType>(undefined);
  const { width: containerWidth, height: screenHeight } = useScreenSize();
  // 由于存在底部操作栏，所以容器高度需要扣除底部操作栏高度
  const containerHeight = screenHeight - bottomHeight;

  if (!imageWidth || !imageHeight) return;

  // 如果尺寸没有变化，直接返回缓存值
  if (
    cacheRef.current &&
    cacheRef.current.imageWidth === imageWidth &&
    cacheRef.current.imageHeight === imageHeight &&
    cacheRef.current.containerWidth === containerWidth &&
    cacheRef.current.containerHeight === containerHeight
  ) {
    return cacheRef.current.result;
  }

  let width = containerWidth;
  let height = containerHeight;
  // 自适应宽高
  const autoWidth = (imageWidth / imageHeight) * containerHeight;
  const autoHeight = (imageHeight / imageWidth) * containerWidth;

  if (imageWidth < width && imageHeight < height) {
    // 照片宽高均小于容器宽高 => 正常显示图片
    width = imageWidth;
    height = imageHeight;
  } else if (imageWidth < width && imageHeight >= height) {
    // 照片高大于容器高，但照片宽小于容器宽 => 高度等于容器高，宽度等比缩放
    width = autoWidth;
  } else if (imageWidth >= width && imageHeight < height) {
    // 照片宽大于容器宽，但照片高小于容器高 => 宽度等于容器宽，高度等比缩放
    height = autoHeight;
  } else if (imageWidth / imageHeight > containerWidth / containerHeight) {
    // 照片宽高大于容器宽高，横向照片 => 宽度等于容器宽，高度等比缩放
    height = autoHeight;
  } else {
    // 照片宽高大于容器宽高，纵向照片 => 高度等于容器高，宽度等比缩放
    width = autoWidth;
  }

  // 缩放比例
  const scale = imageWidth / width;

  const result = { width, height, scale };
  cacheRef.current = {
    imageWidth,
    imageHeight,
    containerWidth,
    containerHeight,
    result,
  };

  return result;
};

export default useSuitableCanvasSize;
