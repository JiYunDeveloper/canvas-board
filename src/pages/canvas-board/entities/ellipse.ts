import Graph from "./graph";
import {
  drawDottedLine,
  isPointInEllipse,
  isPointOnEllipticalArcBorder,
  isTopLeftToBottomRight,
} from "../utils";
import { CursorStyle, DottedLineConfig, OperationMode } from "../config";
import type {
  MouseInteractionResult,
  PaintingData,
  UpdateType,
} from "../types";

class Ellipse extends Graph {
  beginX: number;
  beginY: number;
  endX: number;
  endY: number;

  constructor(
    color: string,
    lineWidth: number,
    beginX: number,
    beginY: number
  ) {
    super(color, lineWidth);
    this.beginX = beginX;
    this.beginY = beginY;
    this.endX = beginX + 50;
    this.endY = beginY + 50;
  }

  /** 椭圆长轴半径 */
  get radiusX(): number {
    return Math.abs(this.beginX - this.endX) / 2;
  }
  /** 椭圆短轴半径 */
  get radiusY(): number {
    return Math.abs(this.beginY - this.endY) / 2;
  }
  /** 椭圆圆心的 x 轴（水平）坐标 */
  get centerX(): number {
    return Math.min(this.beginX, this.endX) + this.radiusX;
  }
  /** 椭圆圆心的 y 轴（水平）坐标 */
  get centerY(): number {
    return Math.min(this.beginY, this.endY) + this.radiusY;
  }

  update(params: UpdateType): void {
    super.update(params);
    if (params.beginX) this.beginX = params.beginX;
    if (params.beginY) this.beginY = params.beginY;
    if (params.endX) this.endX = params.endX;
    if (params.endY) this.endY = params.endY;
  }

  paint(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;

    // 绘制椭圆：长轴半径：radiusX；短轴半径：radiusY
    // (x+radiusX,y+radiusY)作为中心点坐标，角度从0开始，顺时针到 2*PI
    ctx.ellipse(
      this.centerX,
      this.centerY,
      this.radiusX,
      this.radiusY,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    if (this.isSelected) this.selected(ctx);
  }

  isInside(x: number, y: number): MouseInteractionResult | false {
    const angle = this.calculateAngle();
    const isTLToBR = isTopLeftToBottomRight(
      this.beginX,
      this.beginY,
      this.endX,
      this.endY
    );

    const isLeftTop = isPointOnEllipticalArcBorder(
      x,
      y,
      this.centerX,
      this.centerY,
      this.radiusX,
      this.radiusY,
      // Math.PI,
      // (3 / 2) * Math.PI,
      angle.leftTop[0],
      angle.leftTop[1],
      this.lineWidth
    );
    const isRightBottom = isPointOnEllipticalArcBorder(
      x,
      y,
      this.centerX,
      this.centerY,
      this.radiusX,
      this.radiusY,
      // 0,
      // Math.PI / 2,
      angle.rightBottom[0],
      angle.rightBottom[1],
      this.lineWidth
    );
    if (isLeftTop || isRightBottom)
      return {
        cursorStyle: isTLToBR ? CursorStyle.NwseResize : CursorStyle.NeswResize,
        positionType: isLeftTop
          ? Ellipse.PositionType.LeftTop
          : Ellipse.PositionType.RightBottom,
      };

    const isRightTop = isPointOnEllipticalArcBorder(
      x,
      y,
      this.centerX,
      this.centerY,
      this.radiusX,
      this.radiusY,
      // (3 / 2) * Math.PI,
      // 2 * Math.PI,
      angle.rightTop[0],
      angle.rightTop[1],
      this.lineWidth
    );
    const isLeftBottom = isPointOnEllipticalArcBorder(
      x,
      y,
      this.centerX,
      this.centerY,
      this.radiusX,
      this.radiusY,
      // Math.PI / 2,
      // Math.PI,
      angle.leftBottom[0],
      angle.leftBottom[1],
      this.lineWidth
    );
    if (isRightTop || isLeftBottom)
      return {
        cursorStyle: isTLToBR ? CursorStyle.NeswResize : CursorStyle.NwseResize,
        positionType: isRightTop
          ? Ellipse.PositionType.RightTop
          : Ellipse.PositionType.LeftBottom,
      };

    const halfWidth = this.lineWidth >> 1;
    if (
      isPointInEllipse(
        x,
        y,
        this.centerX,
        this.centerY,
        this.radiusX - halfWidth,
        this.radiusY - halfWidth
      )
    )
      return {
        cursorStyle: CursorStyle.Move,
        positionType: Ellipse.PositionType.Content,
      };

    return false;
  }

  selected(ctx: CanvasRenderingContext2D): void {
    if (!this.isSelected) return;

    const x = Math.min(this.beginX, this.endX) - DottedLineConfig.dashedOffset;
    const y = Math.min(this.beginY, this.endY) - DottedLineConfig.dashedOffset;
    const width = this.radiusX * 2 + DottedLineConfig.dashedOffset * 2;
    const height = this.radiusY * 2 + DottedLineConfig.dashedOffset * 2;

    // 绘制矩形虚线
    drawDottedLine(ctx, x, y, width, height);
  }

  move(offsetX: number, offsetY: number): void {
    this.beginX += offsetX;
    this.beginY += offsetY;
    this.endX += offsetX;
    this.endY += offsetY;
  }

  resize(positionType: string, offsetX: number, offsetY: number): void {
    if (positionType === Ellipse.PositionType.LeftTop) {
      this.beginX += offsetX;
      this.beginY += offsetY;
    } else if (positionType === Ellipse.PositionType.RightTop) {
      this.endX += offsetX;
      this.beginY += offsetY;
    } else if (positionType === Ellipse.PositionType.LeftBottom) {
      this.beginX += offsetX;
      this.endY += offsetY;
    } else if (positionType === Ellipse.PositionType.RightBottom) {
      this.endX += offsetX;
      this.endY += offsetY;
    }
  }

  private calculateAngle() {
    // 判断 begin 是否在 end 的左上方
    if (this.beginX <= this.endX && this.beginY <= this.endY) {
      return {
        leftTop: [Math.PI, (3 / 2) * Math.PI],
        rightBottom: [0, Math.PI / 2],
        rightTop: [(3 / 2) * Math.PI, 2 * Math.PI],
        leftBottom: [Math.PI / 2, Math.PI],
      };
    } else if (this.beginX <= this.endX && this.beginY >= this.endY) {
      // 判断 begin 是否在 end 的左下方
      return {
        leftTop: [Math.PI / 2, Math.PI],
        rightBottom: [(3 / 2) * Math.PI, 2 * Math.PI],
        rightTop: [0, Math.PI / 2],
        leftBottom: [Math.PI, (3 / 2) * Math.PI],
      };
    } else if (this.beginX >= this.endX && this.beginY <= this.endY) {
      // 判断 begin 是否在 end 的右上方
      return {
        leftTop: [(3 / 2) * Math.PI, 2 * Math.PI],
        rightBottom: [Math.PI / 2, Math.PI],
        rightTop: [Math.PI, (3 / 2) * Math.PI],
        leftBottom: [0, Math.PI / 2],
      };
    } else {
      // begin 在 end 的右下方
      return {
        leftTop: [0, Math.PI / 2],
        rightBottom: [Math.PI, (3 / 2) * Math.PI],
        rightTop: [Math.PI / 2, Math.PI],
        leftBottom: [(3 / 2) * Math.PI, 2 * Math.PI],
      };
    }
  }

  toData(): PaintingData {
    return {
      color: this.color,
      lineWidth: this.lineWidth,
      beginX: this.beginX,
      beginY: this.beginY,
      endX: this.endX,
      endY: this.endY,
      operationMode: OperationMode.Ellipse,
    };
  }
}

export default Ellipse;
