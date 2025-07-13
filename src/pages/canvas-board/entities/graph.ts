import type {
  MouseInteractionResult,
  PaintingData,
  UpdateType,
} from "../types";

abstract class Graph {
  color: string;
  lineWidth: number;
  isSelected: boolean = false;
  static PositionType = {
    LeftTop: "left-top",
    LeftBottom: "left-bottom",
    RightTop: "right-top",
    RightBottom: "right-bottom",
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right",
    Content: "content",
  };

  constructor(color: string, lineWidth: number) {
    this.color = color;
    this.lineWidth = lineWidth;
  }

  /** 绘制图形 */
  abstract paint(ctx: CanvasRenderingContext2D): void;

  /** 点击坐标是否在图形里 */
  abstract isInside(x: number, y: number): MouseInteractionResult | false;

  /** 选中图形样式绘制 */
  abstract selected(ctx: CanvasRenderingContext2D): void;

  /** 更新图形属性 */
  update(params: UpdateType): void {
    if (params.color) this.color = params.color;
    if (params.lineWidth) this.lineWidth = params.lineWidth;
  }

  /** 移动图形 */
  abstract move(offsetX: number, offsetY: number): void;

  /** 改变图形大小 */
  abstract resize(positionType: string, offsetX: number, offsetY: number): void;

  /** 转化为数据 */
  abstract toData(): PaintingData;
}

export default Graph;
