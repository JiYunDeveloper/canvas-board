import { throttle } from "lodash";
import React, { useCallback, useEffect, useRef } from "react";
import useSetState from "./hooks/useSetState";
import useCanvasBrush from "./hooks/useCanvasBrush";
import OperationBar from "./components/operation-bar";
import { createGraph, transformCanvasCoord } from "./utils";
import useSuitableCanvasSize from "./hooks/useSuitableCanvasSize";
import { CursorStyle, InitialState, OperationMode } from "./config";
import styles from "./index.module.scss";

const CanvasBoardPage: React.FC = () => {
  const operationRef = useRef<HTMLDivElement>(null);
  const clickCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasBrush = useCanvasBrush();
  const [state, updateState] = useSetState(InitialState);
  const {
    width,
    height,
    scale,
    operationMode,
    color,
    lineWidth,
    text,
    mouseAction,
    imageWidth,
    imageHeight,
  } = state;
  const canvasSize = useSuitableCanvasSize(
    imageWidth,
    imageHeight,
    operationRef.current?.clientHeight || 0
  );

  useEffect(() => {
    if (canvasSize) updateState(canvasSize);
  }, [canvasSize, updateState]);

  const handleUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        canvasBrush.clear();

        updateState({
          imageWidth: img.width,
          imageHeight: img.height,
        });
        canvasBrush.setBackgroundImage(img);
      };
    };
    input.click();
  }, [canvasBrush, updateState]);

  // 鼠标松开事件
  const handleMouseUp = () => {
    updateState({ mouseAction: "move" });
    canvasBrush.setCursor(CursorStyle.Default);
  };

  // 鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasBrush.getCanvasRef();
    if (!canvas) return;

    const { x, y } = transformCanvasCoord(canvas, e.clientX, e.clientY, scale);
    const selectGraph = canvasBrush.getSelectGraph(x, y);

    clickCoordRef.current = { x, y };
    if (selectGraph) {
      // 选中图像 => 拖拽
      updateState({ mouseAction: "drag" });
    } else if (operationMode) {
      updateState({ mouseAction: "draw" });
      const tempOperate = createGraph(
        operationMode,
        color,
        lineWidth,
        x,
        y,
        text
      );
      if (operationMode === OperationMode.Text)
        updateState({ operationMode: undefined });

      canvasBrush.startDraw(tempOperate);
    }
  };

  const handleDrawLine = throttle((endX: number, endY: number) => {
    canvasBrush.endDraw(endX, endY);
  }, 50);

  // 鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasBrush.getCanvasRef();
    if (!canvas) return;

    const { x: endX, y: endY } = transformCanvasCoord(
      canvas,
      e.clientX,
      e.clientY,
      scale
    );

    if (mouseAction === "drag") {
      const { x: startX, y: startY } = clickCoordRef.current;

      const offsetX = endX - startX;
      const offsetY = endY - startY;
      // 更新鼠标点击位置
      clickCoordRef.current = { x: endX, y: endY };

      canvasBrush.drag(offsetX, offsetY);
    } else if (mouseAction === "draw" && operationMode !== undefined) {
      if (operationMode === OperationMode.Line) handleDrawLine(endX, endY);
      else canvasBrush.endDraw(endX, endY);
    } else if (mouseAction === "move") {
      canvasBrush.onPointerOver(endX, endY);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <canvas
          ref={canvasBrush.setCanvasRef.bind(canvasBrush)}
          style={{ width, height }}
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        />
      </div>
      <OperationBar
        state={state}
        ref={operationRef}
        canvasBrush={canvasBrush}
        onUpload={handleUpload}
        updateState={updateState}
      />
    </div>
  );
};

export default React.memo(CanvasBoardPage);
