import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "@ant-design/v5-patch-for-react-19";
import CanvasBoardPage from "./pages/canvas-board/index.tsx";
import "antd/dist/reset.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider locale={zhCN}>
      <CanvasBoardPage />
    </ConfigProvider>
  </StrictMode>
);
