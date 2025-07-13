import type { MouseActionType } from "./types";

const SmallLineWidth = 20;
const MediumLineWidth = 30;
const LargeLineWidth = 40;

/** 线条宽度列表 */
export const LineWidthList = [SmallLineWidth, MediumLineWidth, LargeLineWidth];

/** 初始状态 */
export const InitialState = {
  /** 图片宽度 */
  imageWidth: 0,
  /** 图片高度 */
  imageHeight: 0,
  /** canvas css 宽度 */
  width: 0,
  /** canvas css 高度 */
  height: 0,
  /** 缩放比例 图片宽度/显示宽度 */
  scale: 0,

  /** 画笔颜色 */
  color: "#ffffff",
  /** 画笔线条宽度 */
  lineWidth: SmallLineWidth,
  /** 画笔操作类型 */
  operationMode: undefined as OperationMode | undefined,
  /** 文字 */
  text: "",

  /** 鼠标动作 */
  mouseAction: "move" as MouseActionType,
  /** 鼠标点击坐标 */
  // clickCoord: { x: 0, y: 0 },
};

/** 虚线配置 */
export const DottedLineConfig = {
  /** 虚线颜色 */
  color: "#ffffff",
  /** 虚线格式 */
  lineDash: [20, 50],
  /** 虚线偏移量 */
  dashedOffset: 30,
  lineWidth: 5,
};

/** 操作方式枚举 */
export enum OperationMode {
  Rect = "rect",
  Ellipse = "ellipse",
  Arrow = "arrow",
  Line = "line",
  Text = "text",
}

/** 光标类型 */
export enum CursorStyle {
  Move = "move",
  Default = "default",
  NsResize = "ns-resize",
  EwResize = "ew-resize",
  NwseResize = "nwse-resize",
  NeswResize = "nesw-resize",
}
