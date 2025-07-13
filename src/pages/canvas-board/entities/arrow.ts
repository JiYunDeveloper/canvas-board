import Graph from "./graph";
import type {
  MouseInteractionResult,
  PaintingData,
  UpdateType,
} from "../types";
import {
  drawDottedLine,
  pointToPointDistance,
  pointToSegmentDistance,
} from "../utils";
import { CursorStyle, DottedLineConfig, OperationMode } from "../config";

class Arrow extends Graph {
  beginX: number;
  beginY: number;
  endX: number;
  endY: number;

  static headLength = 100;
  static theta = Math.PI / 6;

  constructor(
    color: string,
    lineWidth: number,
    beginX: number,
    beginY: number
  ) {
    super(color, lineWidth);
    this.beginX = beginX;
    this.beginY = beginY;
    this.endX = beginX + 100;
    this.endY = beginY + 100;
  }

  paint(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(this.beginX, this.beginY);
    ctx.lineTo(this.endX, this.endY);
    ctx.stroke();

    // 绘制箭头的两条边
    ctx.beginPath();
    // 箭头的起点(beginX, beginY)到终点(endX, endY)的直线与水平轴正方向之间的夹角
    const angle = Math.atan2(this.endY - this.beginY, this.endX - this.beginX);
    ctx.moveTo(this.endX, this.endY);
    // 箭头的第一条边
    // this.headLength * Math.cos(angle - this.theta)：水平偏移量
    // this.headLength * Math.sin(angle - this.theta)：垂直偏移量
    ctx.lineTo(
      this.endX - Arrow.headLength * Math.cos(angle - Arrow.theta),
      this.endY - Arrow.headLength * Math.sin(angle - Arrow.theta)
    );
    ctx.moveTo(this.endX, this.endY);
    // 箭头的第二条边
    ctx.lineTo(
      this.endX - Arrow.headLength * Math.cos(angle + Arrow.theta),
      this.endY - Arrow.headLength * Math.sin(angle + Arrow.theta)
    );
    ctx.stroke();

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
    const isTop =
      pointToPointDistance(x, y, this.beginX, this.beginY) <= halfLineWidth;
    const isBottom =
      pointToPointDistance(x, y, this.endX, this.endY) <= halfLineWidth;
    if (isTop || isBottom)
      return {
        cursorStyle: CursorStyle.NsResize,
        positionType: isTop
          ? Arrow.PositionType.Top
          : Arrow.PositionType.Bottom,
      };

    if (
      pointToSegmentDistance(
        x,
        y,
        this.beginX,
        this.beginY,
        this.endX,
        this.endY
      ) <= halfLineWidth
    )
      return {
        cursorStyle: CursorStyle.Move,
        positionType: Arrow.PositionType.Content,
      };

    return false;
  }

  selected(ctx: CanvasRenderingContext2D): void {
    if (!this.isSelected) return;
    const width =
      Math.abs(this.beginX - this.endX) + DottedLineConfig.dashedOffset * 2;
    const height =
      Math.abs(this.beginY - this.endY) + DottedLineConfig.dashedOffset * 2;

    drawDottedLine(
      ctx,
      Math.min(this.beginX, this.endX) - DottedLineConfig.dashedOffset,
      Math.min(this.beginY, this.endY) - DottedLineConfig.dashedOffset,
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
    if (positionType === Arrow.PositionType.Top) {
      this.beginX += offsetX;
      this.beginY += offsetY;
    } else if (positionType === Arrow.PositionType.Bottom) {
      this.endX += offsetX;
      this.endY += offsetY;
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
      operationMode: OperationMode.Arrow,
    };
  }
}

export default Arrow;
