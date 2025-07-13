import { useRef } from "react";
import { CanvasBrush } from "../entities";

const useCanvasBrush = () => {
  const { current } = useRef({
    sign: false,
    brush: undefined as CanvasBrush | undefined,
  });

  if (!current.sign) {
    current.sign = true;
    current.brush = new CanvasBrush();
  }

  return current.brush as CanvasBrush;
};

export default useCanvasBrush;
