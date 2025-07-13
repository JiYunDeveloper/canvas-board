import Graph from "./graph";
import { drawDottedLine } from "../utils";
import { CursorStyle, DottedLineConfig, OperationMode } from "../config";
import type {
  MouseInteractionResult,
  PaintingData,
  UpdateType,
} from "../types";

class Text extends Graph {
  beginX: number;
  beginY: number;
  text: string;
  measure: TextMetrics | undefined;

  static textZoomRatio = 5;

  constructor(
    color: string,
    lineWidth: number,
    beginX: number,
    beginY: number,
    text: string
  ) {
    super(color, lineWidth);
    this.beginX = beginX;
    this.beginY = beginY;
    this.text = text;
  }

  paint(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();

    // 使用lineWidth作为字体大小
    ctx.font = `${this.lineWidth * Text.textZoomRatio}px webfont`;

    // 设置文本顶部基线
    ctx.textBaseline = "top";
    ctx.fillStyle = this.color;

    this.measure = ctx.measureText(this.text);

    ctx.fillText(this.text, this.beginX, this.beginY);
    if (this.isSelected) this.selected(ctx);
  }

  update(params: UpdateType): void {
    super.update(params);
    if (params.beginX) this.beginX = params.beginX;
    if (params.beginY) this.beginY = params.beginY;
    if (params.text) this.text = params.text;
  }

  isInside(x: number, y: number): MouseInteractionResult | false {
    if (this.measure) {
      const textWidth = this.measure.width;
      const textHeight =
        this.measure.actualBoundingBoxAscent +
        this.measure.actualBoundingBoxDescent;

      // 判断是否在文本区域内，在区域内即选中
      if (
        x >= this.beginX &&
        x <= this.beginX + textWidth &&
        y >= this.beginY &&
        y <= this.beginY + textHeight
      ) {
        return {
          cursorStyle: CursorStyle.Move,
          positionType: Text.PositionType.Content,
        };
      }
    }

    return false;
  }

  selected(ctx: CanvasRenderingContext2D): void {
    if (!this.measure) return;

    const textWidth = this.measure.width + DottedLineConfig.dashedOffset * 2;
    // 以文本基线到顶线和底线的距离作为文本高度
    const textHeight =
      this.measure.actualBoundingBoxAscent +
      this.measure.actualBoundingBoxDescent +
      DottedLineConfig.dashedOffset * 2;

    drawDottedLine(
      ctx,
      this.beginX - DottedLineConfig.dashedOffset,
      this.beginY - DottedLineConfig.dashedOffset,
      textWidth,
      textHeight
    );
  }

  move(offsetX: number, offsetY: number): void {
    this.beginX += offsetX;
    this.beginY += offsetY;
  }

  resize(): void {}

  toData(): PaintingData {
    return {
      color: this.color,
      lineWidth: this.lineWidth,
      beginX: this.beginX,
      beginY: this.beginY,
      text: this.text,
      operationMode: OperationMode.Text,
    };
  }
}

export default Text;
