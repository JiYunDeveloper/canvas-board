import Graph from "./graph";
import { CursorStyle, DottedLineConfig, OperationMode } from "../config";
import {
  drawDottedLine,
  isPointInRectangle,
  isTopLeftToBottomRight,
} from "../utils";
import type {
  MouseInteractionResult,
  PaintingData,
  UpdateType,
} from "../types";

class Rectangle extends Graph {
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
    this.endX = beginX;
    this.endY = beginY;
  }

  /** 矩形最小X坐标，方便计算 */
  get minX(): number {
    return Math.min(this.beginX, this.endX);
  }
  /** 矩形最大X坐标 */
  get maxX(): number {
    return Math.max(this.beginX, this.endX);
  }
  /** 矩形最小Y坐标 */
  get minY(): number {
    return Math.min(this.beginY, this.endY);
  }
  /** 矩形最大Y坐标 */
  get maxY(): number {
    return Math.max(this.beginY, this.endY);
  }

  paint(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    const width = this.maxX - this.minX;
    const height = this.maxY - this.minY;
    ctx.strokeRect(this.minX, this.minY, width, height);

    if (this.isSelected) this.selected(ctx);
  }

  update(params: UpdateType): void {
    super.update(params);

    if (params.beginX) this.beginX = params.beginX;
    if (params.beginY) this.beginY = params.beginY;
    if (params.endX) this.endX = params.endX;
    if (params.endY) this.endY = params.endY;
  }

  isInside(x: number, y: number): MouseInteractionResult | false {
    const halfLineWidth = this.lineWidth >> 1;
    const borderTop = this.beginY - halfLineWidth,
      borderLeft = this.beginX - halfLineWidth,
      borderBottom = this.endY + halfLineWidth,
      borderRight = this.endX + halfLineWidth;
    const contentTop = this.beginY + halfLineWidth,
      contentLeft = this.beginX + halfLineWidth,
      contentBottom = this.endY - halfLineWidth,
      contentRight = this.endX - halfLineWidth;
    const isTLToBR = isTopLeftToBottomRight(
      this.beginX,
      this.beginY,
      this.endX,
      this.endY
    );

    const isLeftTop = isPointInRectangle(
      x,
      y,
      borderLeft,
      borderTop,
      contentLeft,
      contentTop
    );
    const isRightBottom = isPointInRectangle(
      x,
      y,
      contentRight,
      contentBottom,
      borderRight,
      borderBottom
    );
    if (isLeftTop || isRightBottom)
      return {
        cursorStyle: isTLToBR ? CursorStyle.NwseResize : CursorStyle.NeswResize,
        positionType: isLeftTop
          ? Rectangle.PositionType.LeftTop
          : Rectangle.PositionType.RightBottom,
      };

    const isRightTop = isPointInRectangle(
      x,
      y,
      contentRight,
      borderTop,
      borderRight,
      contentTop
    );
    const isLeftBottom = isPointInRectangle(
      x,
      y,
      borderLeft,
      contentBottom,
      contentLeft,
      borderBottom
    );
    if (isRightTop || isLeftBottom)
      return {
        cursorStyle: isTLToBR ? CursorStyle.NeswResize : CursorStyle.NwseResize,
        positionType: isRightTop
          ? Rectangle.PositionType.RightTop
          : Rectangle.PositionType.LeftBottom,
      };

    const isTop = isPointInRectangle(
      x,
      y,
      contentLeft,
      borderTop,
      contentRight,
      contentTop
    );
    const isBottom = isPointInRectangle(
      x,
      y,
      contentLeft,
      contentBottom,
      contentRight,
      borderBottom
    );
    if (isTop || isBottom)
      return {
        cursorStyle: CursorStyle.NsResize,
        positionType: isTop
          ? Rectangle.PositionType.Top
          : Rectangle.PositionType.Bottom,
      };

    const isLeft = isPointInRectangle(
      x,
      y,
      borderLeft,
      contentTop,
      contentLeft,
      contentBottom
    );
    const isRight = isPointInRectangle(
      x,
      y,
      contentRight,
      contentTop,
      borderRight,
      contentBottom
    );
    if (isLeft || isRight)
      return {
        cursorStyle: CursorStyle.EwResize,
        positionType: isLeft
          ? Rectangle.PositionType.Left
          : Rectangle.PositionType.Right,
      };

    if (
      isPointInRectangle(
        x,
        y,
        contentLeft,
        contentTop,
        contentRight,
        contentBottom
      )
    ) {
      return {
        cursorStyle: CursorStyle.Move,
        positionType: Rectangle.PositionType.Content,
      };
    }

    return false;
  }

  selected(ctx: CanvasRenderingContext2D): void {
    if (!this.isSelected) return;
    const width = this.maxX - this.minX + DottedLineConfig.dashedOffset * 2;
    const height = this.maxY - this.minY + DottedLineConfig.dashedOffset * 2;
    drawDottedLine(
      ctx,
      this.minX - DottedLineConfig.dashedOffset,
      this.minY - DottedLineConfig.dashedOffset,
      width,
      height
    );
  }

  move(offsetX: number, offsetY: number): void {
    this.beginX += offsetX;
    this.beginY += offsetY;
    this.endX += offsetX;
    this.endY += offsetY;
  }

  resize(positionType: string, offsetX: number, offsetY: number): void {
    if (positionType === Rectangle.PositionType.LeftTop) {
      this.beginX += offsetX;
      this.beginY += offsetY;
    } else if (positionType === Rectangle.PositionType.RightTop) {
      this.endX += offsetX;
      this.beginY += offsetY;
    } else if (positionType === Rectangle.PositionType.LeftBottom) {
      this.beginX += offsetX;
      this.endY += offsetY;
    } else if (positionType === Rectangle.PositionType.RightBottom) {
      this.endX += offsetX;
      this.endY += offsetY;
    } else if (positionType === Rectangle.PositionType.Top) {
      this.beginY += offsetY;
    } else if (positionType === Rectangle.PositionType.Left) {
      this.beginX += offsetX;
    } else if (positionType === Rectangle.PositionType.Bottom) {
      this.endY += offsetY;
    } else if (positionType === Rectangle.PositionType.Right) {
      this.endX += offsetX;
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
      operationMode: OperationMode.Rect,
    };
  }
}

export default Rectangle;
