import type { Trace } from "./types";
import { DottedLineConfig, OperationMode } from "./config";
import { Line, Rectangle, Arrow, Ellipse, Text } from "./entities";

/** 获取合适的画布css尺寸 */
export const getSuitableCanvasSize = (
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number
) => {
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

  return { width, height, scale };
};

/** 绘制虚线 */
export const drawDottedLine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.beginPath();
  ctx.setLineDash(DottedLineConfig.lineDash);
  ctx.strokeStyle = DottedLineConfig.color;
  ctx.lineWidth = DottedLineConfig.lineWidth;
  ctx.lineCap = "round";
  ctx.strokeRect(x, y, width, height);
  ctx.setLineDash([]); // 清除虚线配置
};

/** 将页面坐标转换为画布坐标 */
export const transformCanvasCoord = (
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  scale: number
) => {
  const { left, top } = canvas.getBoundingClientRect();

  // 点击位置相对于画布左上角的偏移量
  const dx = clientX - left;
  const dy = clientY - top;

  const x = dx * scale;
  const y = dy * scale;
  return { x, y };
};

/** 创建图形对象 */
export const createGraph = (
  type: OperationMode,
  color: string,
  lineWidth: number,
  startX: number,
  startY: number,
  text?: string
) => {
  switch (type) {
    case OperationMode.Text:
      return new Text(color, lineWidth, startX, startY, text || "");
    case OperationMode.Line:
      return new Line(color, lineWidth, startX, startY);
    case OperationMode.Rect:
      return new Rectangle(color, lineWidth, startX, startY);
    case OperationMode.Ellipse:
      return new Ellipse(color, lineWidth, startX, startY);
    case OperationMode.Arrow:
      return new Arrow(color, lineWidth, startX, startY);
    default:
      throw new Error("暂不支持该类型");
  }
};

/** 判断两个对角点是否是左上到右下的方向（或右下到左上） */
export const isTopLeftToBottomRight = (
  beginX: number,
  beginY: number,
  endX: number,
  endY: number
) => {
  // 计算x和y方向的变化量
  const dx = endX - beginX;
  const dy = endY - beginY;

  // 在canvas坐标系中，y轴向下为正
  // 左上到右下的方向意味着dx和dy同号（同为正或同为负）
  return dx * dy >= 0;
};

/**
 * 计算二维平面中两点间的距离
 * 距离公式为：AB = sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}
 * @param point1 - 第一个点的坐标
 * @param point2 - 第二个点的坐标
 * @returns 两点间的距离
 */
export const pointToPointDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  // 计算坐标差值的平方和
  const squaredSum = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);

  return Math.sqrt(squaredSum);
};

/**
 * 判断一个数值是否在两个数值之间
 * @param {number} value - 数值
 * @param {number} min - 范围下限
 * @param {number} max - 范围上限
 * @returns {boolean}
 */
export const isNumberBetween = (value: number, min: number, max: number) => {
  // 确保min不大于max
  if (min > max) [min, max] = [max, min];

  return value >= min && value <= max;
};

/** 判断一个点是否在二维坐标系中的矩形内 */
export const isPointInRectangle = (
  pointX: number,
  pointY: number,
  topLeftX: number,
  topLeftY: number,
  bottomRightX: number,
  bottomRightY: number
) => {
  return (
    isNumberBetween(pointX, topLeftX, bottomRightX) &&
    isNumberBetween(pointY, topLeftY, bottomRightY)
  );
};

/** 判断点是否在Canvas椭圆弧的边框上 */
export const isPointOnEllipticalArcBorder = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  startAngle: number,
  endAngle: number,
  lineWidth: number
) => {
  // 转换为以椭圆中心为原点的相对坐标
  const relX = x - centerX;
  const relY = y - centerY;

  // 计算点到椭圆中心的距离和角度
  const distance = pointToPointDistance(x, y, centerX, centerY);
  let angle = Math.atan2(relY, relX); // 适配Canvas坐标系
  angle = angle < 0 ? angle + 2 * Math.PI : angle; // 转换为[0, 2π)

  const isAngleInRange = angle >= startAngle && angle <= endAngle;
  if (!isAngleInRange) return false;

  // 计算椭圆在该角度的理论半径
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);
  const ellipseRadius =
    (radiusX * radiusY) /
    Math.sqrt(
      Math.pow(radiusY * cosAngle, 2) + Math.pow(radiusX * sinAngle, 2)
    );

  // 检查点是否在边框宽度范围内
  const halfWidth = lineWidth >> 1;
  return Math.abs(distance - ellipseRadius) <= halfWidth;
};

/** 判断一个点是否在椭圆内部 */
export const isPointInEllipse = (
  pointX: number,
  pointY: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
) => {
  // 计算点到椭圆中心的相对坐标
  const dx = pointX - centerX;
  const dy = pointY - centerY;

  // 椭圆的标准方程：(x/a)² + (y/b)² = 1
  // 椭圆内部的点满足：(x/a)² + (y/b)² < 1
  // 椭圆外部的点满足：(x/a)² + (y/b)² > 1
  return dx ** 2 / radiusX ** 2 + dy ** 2 / radiusY ** 2 < 1;
};

/* 计算二维坐标中点到线段的距离 */
export const pointToSegmentDistance = (
  pointX: number,
  pointY: number,
  lineStartX: number,
  lineStartY: number,
  lineEndX: number,
  lineEndY: number
) => {
  // 线段向量 (lineEndX-lineStartX, lineEndY-lineStartY)
  const lx = lineEndX - lineStartX;
  const ly = lineEndY - lineStartY;

  // 线段长度的平方
  const lenSquared = lx * lx + ly * ly;

  // 计算投影比例 t（点在线段上的投影位置）
  let t =
    ((pointX - lineStartX) * lx + (pointY - lineStartY) * ly) / lenSquared;

  // 处理线段长度为零的情况（起点和终点重合）
  if (lenSquared === 0) t = 0;

  // 将 t 限制在 [0,1] 范围内（确保投影在线段上）
  t = Math.max(0, Math.min(1, t));

  // 计算投影点坐标
  const projectionX = lineStartX + t * lx;
  const projectionY = lineStartY + t * ly;

  // 计算点到投影点的距离
  return Math.hypot(pointX - projectionX, pointY - projectionY);
};

/** 计算点到二次贝塞尔曲线的最小距离 */
const isPointOnBezier = (
  pointX: number,
  pointY: number,
  bezierPoints: [Trace, Trace, Trace],
  threshold: number
) => {
  const [p0, p1, p2] = bezierPoints;
  let minDistance = Infinity;

  // 参数 t 均匀采样：对每段曲线在参数 t 上均匀采样，计算点到曲线上各采样点的最小距离
  // 减少采样点（从0.01提高到0.05）
  for (let t = 0; t <= 1; t += 0.05) {
    // 计算贝塞尔曲线上的点
    const bx =
      (1 - t) ** 2 * p0.posX + 2 * (1 - t) * t * p1.posX + t ** 2 * p2.posX;
    const by =
      (1 - t) ** 2 * p0.posY + 2 * (1 - t) * t * p1.posY + t ** 2 * p2.posY;

    // 计算欧氏距离（避免开平方以节省性能）
    const dx = bx - pointX;
    const dy = by - pointY;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared < minDistance) {
      minDistance = distanceSquared;
    }

    // 提前终止：若已找到足够近的点
    if (distanceSquared < threshold * threshold) {
      return true;
    }
  }

  // 最后比较时再开平方
  return Math.sqrt(minDistance) <= threshold;
};

/* 判断点是否在平滑曲线上（采用包围盒检测和均匀采样） */
export const isPointOnSmoothCurve = (
  pointX: number,
  pointY: number,
  traces: Trace[],
  threshold = 10
) => {
  /** 计算二次贝塞尔曲线的包围盒 */
  const getBezierBounds = (p0: Trace, p1: Trace, p2: Trace) => {
    const minX = Math.min(p0.posX, p1.posX, p2.posX);
    const maxX = Math.max(p0.posX, p1.posX, p2.posX);
    const minY = Math.min(p0.posY, p1.posY, p2.posY);
    const maxY = Math.max(p0.posY, p1.posY, p2.posY);
    return { minX, maxX, minY, maxY };
  };

  /** 检查点是否在包围盒内 */
  const isPointInBounds = (
    pointX: number,
    pointY: number,
    bounds: ReturnType<typeof getBezierBounds>
  ) => {
    return (
      pointX >= bounds.minX - 5 && // 增加一定的误差范围
      pointX <= bounds.maxX + 5 &&
      pointY >= bounds.minY - 5 &&
      pointY <= bounds.maxY + 5
    );
  };

  if (traces.length === 0) return false;

  // 特殊处理：只有一个点时，判断是否在点的范围内
  if (traces.length === 1) {
    return (
      pointToPointDistance(pointX, pointY, traces[0].posX, traces[0].posY) <=
      threshold
    );
  }

  // 多个点时，使用贝塞尔曲线逻辑
  // 分段贝塞尔曲线：将长曲线拆分为多段二次贝塞尔曲线（每段由相邻点和控制点组成）
  for (let i = 0; i < traces.length - 1; i++) {
    // const p0 = i > 0 ? traces[i - 1] : traces[i];
    // 曲线方程：B(t) = (1-t)²·pStart + 2(1-t)t·pControl + t²·pEnd （t∈[0,1]）
    const pStart = traces[i]; // 当前点（曲线起点）
    const pEnd = traces[i + 1]; // 下一点（曲线终点）
    const pControl: Trace = {
      posX: (pStart.posX + pEnd.posX) / 2,
      posY: (pStart.posY + pEnd.posY) / 2,
    }; // 控制点为相邻两点的中点

    // 包围盒快速过滤：先检查点是否在曲线的外包矩形内，快速排除明显不在曲线上的点
    const bounds = getBezierBounds(pStart, pControl, pEnd);
    if (!isPointInBounds(pointX, pointY, bounds)) continue;

    // 计算点到贝塞尔曲线的最小距离
    if (isPointOnBezier(pointX, pointY, [pStart, pControl, pEnd], threshold))
      return true;
  }

  return false;
};
