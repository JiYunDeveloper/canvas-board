import Graph from "./graph";
import type {
  Trace,
  UpdateType,
  PaintingData,
  MouseInteractionResult,
} from "../types";
import { drawDottedLine, isPointOnSmoothCurve } from "../utils";
import { CursorStyle, DottedLineConfig, OperationMode } from "../config";

class Line extends Graph {
  traces: Trace[];

  constructor(color: string, lineWidth: number, posX: number, posY: number) {
    super(color, lineWidth);
    this.traces = [];
    this.traces.push({ posX, posY });
  }

  update(params: UpdateType): void {
    super.update(params);
    if (params.traces) this.traces = params.traces;
    if (params.endX && params.endY)
      this.traces.push({
        posX: params.endX,
        posY: params.endY,
      });
  }

  paint(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const { posX, posY } = this.traces[0];
    ctx.moveTo(posX, posY);
    // 如果只有两个点，则直接绘制一条线段，否则使用二次贝塞尔曲线连接
    if (this.traces.length < 2) {
      for (const { posX, posY } of this.traces) {
        ctx.lineTo(posX, posY);
      }
    } else {
      for (let i = 1; i < this.traces.length - 1; i++) {
        const cpx = (this.traces[i].posX + this.traces[i + 1].posX) / 2;
        const cpy = (this.traces[i].posY + this.traces[i + 1].posY) / 2;
        ctx.quadraticCurveTo(
          this.traces[i].posX,
          this.traces[i].posY,
          cpx,
          cpy
        );
      }

      // 连接最后一个点
      ctx.lineTo(
        this.traces[this.traces.length - 1].posX,
        this.traces[this.traces.length - 1].posY
      );
    }

    ctx.stroke();

    if (this.isSelected) this.selected(ctx);
  }

  isInside(x: number, y: number): MouseInteractionResult | false {
    if (isPointOnSmoothCurve(x, y, this.traces, this.lineWidth)) {
      return {
        cursorStyle: CursorStyle.Move,
        positionType: Line.PositionType.Content,
      };
    }

    return false;
  }

  selected(ctx: CanvasRenderingContext2D): void {
    if (!this.isSelected) return;
    const { minX, minY, maxX, maxY } = this.getLineBoundary();
    const width = maxX - minX + DottedLineConfig.dashedOffset * 2;
    const height = maxY - minY + DottedLineConfig.dashedOffset * 2;

    drawDottedLine(
      ctx,
      minX - DottedLineConfig.dashedOffset,
      minY - DottedLineConfig.dashedOffset,
      width,
      height
    );
  }

  move(offsetX: number, offsetY: number): void {
    this.traces.forEach((coord) => {
      coord.posX += offsetX;
      coord.posY += offsetY;
    });
  }

  resize(): void {}

  /** 获取线段最大X\Y、最小X\Y */
  private getLineBoundary() {
    const { posX, posY } = this.traces[0];
    let minX = posX,
      minY = posY,
      maxX = posX,
      maxY = posY;

    this.traces.forEach(({ posX, posY }) => {
      if (posX < minX) minX = posX;
      if (posY < minY) minY = posY;
      if (posX > maxX) maxX = posX;
      if (posY > maxY) maxY = posY;
    });
    return { minX, minY, maxX, maxY };
  }

  toData(): PaintingData {
    return {
      color: this.color,
      lineWidth: this.lineWidth,
      traces: this.traces,
      operationMode: OperationMode.Line,
    };
  }
}

export default Line;
