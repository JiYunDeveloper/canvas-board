import Graph from "./graph";
import { CursorStyle } from "../config";
import type { MouseInteractionResult, PaintingData } from "../types";

class CanvasBrush {
  /** 画布操作栈 */
  private operates: Graph[];
  /** 画布 */
  private canvas: HTMLCanvasElement | undefined;
  /** 画布上下文 */
  private ctx: CanvasRenderingContext2D | undefined;
  /** 背景图片 */
  private backgroundImage: HTMLImageElement | undefined;

  /** 选中的图形索引 */
  private selectGraphIndex: number | undefined;
  /** 选中的图形交互结果 */
  private selectGraphResult: MouseInteractionResult | undefined;

  /** 撤销操作的栈 */
  private restores: Graph[] = [];

  constructor(
    canvas?: HTMLCanvasElement | HTMLImageElement,
    image?: HTMLImageElement
  ) {
    this.operates = [];

    if (canvas instanceof HTMLCanvasElement) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d")!;

      if (image instanceof HTMLImageElement) {
        this.backgroundImage = image;
      }
    } else if (canvas instanceof HTMLImageElement) {
      this.backgroundImage = canvas;
    }
  }

  /** 设置光标样式 */
  setCursor(cursor: string) {
    if (!this.canvas) return;

    this.canvas.style.cursor = cursor;
  }

  /** 设置画布背景 */
  setBackgroundImage(image: HTMLImageElement) {
    this.backgroundImage = image;

    if (this.canvas) {
      const { naturalWidth, naturalHeight } = image;
      this.canvas.width = naturalWidth;
      this.canvas.height = naturalHeight;
    }

    this.paint();
  }

  /** 设置画布背景 */
  setCanvasRef(canvas: HTMLCanvasElement | null) {
    if (!canvas || this.canvas === canvas) return;

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  getCanvasRef() {
    return this.canvas;
  }

  /** 获取选中的图形 */
  getSelectGraph(x: number, y: number) {
    // 如果已经有选中的图形，取消其选中状态
    if (
      this.selectGraphIndex !== undefined &&
      this.operates[this.selectGraphIndex]
    ) {
      this.operates[this.selectGraphIndex].isSelected = false;
    }

    // 从后往前遍历，找到被选中的图形
    for (let i = this.operates.length - 1; i >= 0; i--) {
      const currentOperate = this.operates[i];
      const result = currentOperate.isInside(x, y);
      if (result) {
        this.selectGraphIndex = i;
        this.selectGraphResult = result;
        currentOperate.isSelected = true;
        this.paint();
        return true;
      }
    }

    this.selectGraphIndex = undefined;
    this.selectGraphResult = undefined;

    this.paint();
  }

  /** 鼠标在画布上移动 */
  onPointerOver(x: number, y: number) {
    for (let i = this.operates.length - 1; i >= 0; i--) {
      const currentOperate = this.operates[i];
      const result = currentOperate.isInside(x, y);
      if (result) {
        this.setCursor(result.cursorStyle);
        return;
      }
    }
    this.setCursor(CursorStyle.Default);
  }

  /** 清空画布 */
  clear() {
    this.operates = [];
    this.backgroundImage = undefined;
    this.selectGraphIndex = undefined;
    this.restores = [];
    this.paint();
  }

  /** 开始画图 */
  startDraw(graph: Graph) {
    this.operates.push(graph);
    this.restores = [];
    this.paint();
  }

  /** 结束画图 */
  endDraw(endX: number, endY: number) {
    const temp = this.operates[this.operates.length - 1];
    temp.update({ endX, endY });
    this.paint();
  }

  /** 拖动图形 */
  drag(offsetX: number, offsetY: number) {
    if (
      this.selectGraphIndex === undefined ||
      this.selectGraphResult === undefined
    )
      return;
    const selectGraph = this.operates[this.selectGraphIndex];

    if (this.selectGraphResult.positionType === Graph.PositionType.Content)
      selectGraph.move(offsetX, offsetY);
    else
      selectGraph.resize(this.selectGraphResult.positionType, offsetX, offsetY);

    this.paint();
  }

  /** 删除选中元素 */
  deleteSelectGraph() {
    if (this.selectGraphIndex !== undefined) {
      this.operates.splice(this.selectGraphIndex, 1);
    }
    this.paint();
  }

  /** 回退操作 */
  rollback() {
    if (this.operates.length > 0) {
      // 把最后一个操作弹出，并加入到恢复栈中
      const tempGraph = this.operates.pop();
      if (tempGraph) this.restores.push(tempGraph);
      this.paint();
    } else throw new Error("已经没有操作可以回退了");
  }

  /** 前进操作 */
  forward() {
    if (this.restores.length > 0) {
      // 把恢复栈的最后一个操作弹出，并加入到操作栈中
      const tempGraph = this.restores.pop();
      if (tempGraph) this.operates.push(tempGraph);
      this.paint();
    } else throw new Error("已经没有操作可以恢复了");
  }

  /** 修改选中的图形 */
  changeSelectGraph(obj: { color?: string; lineWidth?: number }) {
    if (this.selectGraphIndex === undefined) return;
    const selectGraph = this.operates[this.selectGraphIndex];
    selectGraph.update(obj);
    this.paint();
  }

  /** 画布绘制 */
  paint() {
    if (!this.ctx || !this.canvas) return;

    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    if (this.backgroundImage)
      this.ctx.drawImage(this.backgroundImage, 0, 0, width, height);
    this.operates.forEach((operate) => {
      requestAnimationFrame(() => {
        operate.paint(this.ctx!);
      });
    });
  }

  toData(): PaintingData[] {
    return this.operates.map((operate) => operate.toData());
  }
}

export default CanvasBrush;
