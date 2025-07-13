import React, { type ChangeEvent } from "react";
import { Button, Form, Input, message, Modal } from "antd";
import {
  BorderOutlined,
  DeleteOutlined,
  EnterOutlined,
  FontSizeOutlined,
  HighlightOutlined,
  Loading3QuartersOutlined,
  SwapLeftOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import type { CanvasBrush } from "../../entities";
import { LineWidthList, OperationMode } from "../../config";
import type { StateType, UpdateStateType } from "../../types";
import styles from "./index.module.scss";

type Props = {
  ref: React.Ref<HTMLDivElement | null>;
  state: StateType;
  canvasBrush: CanvasBrush;
  onUpload: () => void;
  updateState: UpdateStateType;
};
const OperationBar: React.FC<Props> = (props) => {
  const {
    ref,
    canvasBrush,
    state: { lineWidth, color, operationMode },
    updateState,
    onUpload,
  } = props;
  const [form] = Form.useForm();

  const handleLineWidthChange = (lineWidth: number) => () => {
    updateState({ lineWidth });
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateState({ color: e.target.value });
  };

  const handleStepChange = (type: "rollback" | "forward" | "delete") => () => {
    try {
      if (type === "rollback") canvasBrush.rollback();
      else if (type === "forward") canvasBrush.forward();
      else canvasBrush.deleteSelectGraph();
    } catch (e: unknown) {
      if (e instanceof Error) message.error(e.message);
    }
  };

  const handleModeChange = (type: OperationMode) => () => {
    const newMode = operationMode === type ? undefined : type;
    updateState({ operationMode: newMode });
  };

  const handleTextClick = () => {
    if (operationMode === OperationMode.Text)
      return updateState({ operationMode: undefined });

    form.resetFields();
    Modal.confirm({
      title: "请输入备注文字",
      content: (
        <Form form={form}>
          <Form.Item
            name="text"
            rules={[{ required: true, message: "请输入文字" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          await form.validateFields();
        } catch (e: unknown) {
          return Promise.reject(e);
        }
        const text = await form.getFieldsValue().text;
        updateState({ operationMode: OperationMode.Text, text });
      },
    });
  };

  const handleToJSON = () => {
    console.log(JSON.stringify(canvasBrush.toData()));
  };

  return (
    <div className={styles.bar} ref={ref}>
      <Button type="primary" size="small" onClick={onUpload}>
        选择图片
      </Button>
      {LineWidthList.map((item) => (
        <div
          key={item}
          className={`${styles.lineWidth} ${
            lineWidth === item ? styles.lineWidthActive : ""
          }`}
          onClick={handleLineWidthChange(item)}
          style={{ width: item / 2 }}
        />
      ))}
      <input
        type="color"
        value={color}
        className={styles.color}
        onChange={handleColorChange}
      />
      <SwapLeftOutlined
        className={styles.icon}
        onClick={handleStepChange("rollback")}
      />
      <SwapRightOutlined
        className={styles.icon}
        onClick={handleStepChange("forward")}
      />
      <FontSizeOutlined
        className={`${styles.icon} ${
          operationMode === OperationMode.Text ? styles.iconActive : ""
        }`}
        onClick={handleTextClick}
      />
      <HighlightOutlined
        className={`${styles.icon} ${
          operationMode === OperationMode.Line ? styles.iconActive : ""
        }`}
        onClick={handleModeChange(OperationMode.Line)}
      />
      <BorderOutlined
        className={`${styles.icon} ${
          operationMode === OperationMode.Rect ? styles.iconActive : ""
        }`}
        onClick={handleModeChange(OperationMode.Rect)}
      />
      <Loading3QuartersOutlined
        className={`${styles.icon} ${
          operationMode === OperationMode.Ellipse ? styles.iconActive : ""
        }`}
        onClick={handleModeChange(OperationMode.Ellipse)}
      />
      <EnterOutlined
        className={`${styles.icon} ${
          operationMode === OperationMode.Arrow ? styles.iconActive : ""
        }`}
        onClick={handleModeChange(OperationMode.Arrow)}
      />
      <DeleteOutlined
        className={styles.icon}
        onClick={handleStepChange("delete")}
      />
      <Button type="primary" size="small" onClick={handleToJSON}>
        toJSON
      </Button>
    </div>
  );
};

export default React.memo(OperationBar);
