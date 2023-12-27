import { useCallback, useState } from "react";

const useNodeSize = () => {
  const [width, setWidth] = useState(-1);
  const [height, setHeight] = useState(-1);
  const ref = useCallback((node: HTMLElement) => {
    if (node) {
      setWidth(node.clientWidth);
      setHeight(node.clientHeight);
    }
  }, []);

  return { ref, width, height };
};

export default useNodeSize;