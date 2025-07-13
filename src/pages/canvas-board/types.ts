import { InitialState, OperationMode } from "./config";

/** 鼠标交互结果类型 */
export type MouseInteractionResult = {
  cursorStyle: string;
  positionType: string;
};

/** 轨迹 */
export type Trace = {
  posX: number;
  posY: number;
};

/** 更新类型 */
export type UpdateType = Partial<{
  color: string;
  lineWidth: number;
  beginX: number;
  beginY: number;
  endX: number;
  endY: number;
  traces: Trace[];
  text: string;
}>;

/** 画板数据类型 */
export type StateType = typeof InitialState;

/** 更新画板数据类型 */
export type UpdateStateType = React.Dispatch<Partial<StateType>>;

/** 鼠标动作：移动 move、拖拽 drag、画图 draw */
export type MouseActionType = "move" | "drag" | "draw";

/** 绘画数据类型 */
export type PaintingData = Partial<{
  color: string;
  lineWidth: number;
  traces: {
    posX: number;
    posY: number;
  }[];
  beginX: number;
  beginY: number;
  endX: number;
  endY: number;
  text: string;
  operationMode: OperationMode;
}>;
