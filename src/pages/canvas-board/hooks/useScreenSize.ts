import { useEffect } from "react";
import useSetState from "./useSetState";

/** 获取屏幕尺寸 */
const useScreenSize = () => {
  const [state, updateState] = useSetState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      updateState({ width, height });
    };
    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};

export default useScreenSize;
