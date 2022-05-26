import { useInViewport } from "ahooks";
import { FC, useEffect, useState } from "react";

type LayLoadProps = {
  targetRef: React.RefObject<HTMLElement>;
  skeletonCmp: JSX.Element;
  forceLoad?: boolean;
};

const LayLoad: FC<LayLoadProps> = ({ targetRef, children, skeletonCmp, forceLoad }) => {
  const [inViewPort] = useInViewport(targetRef);
  const [renderFlag, setRenderFlag] = useState(false);

  useEffect(() => {
    if ((inViewPort || forceLoad) && !renderFlag) {
      setRenderFlag(true);
    }
  }, [inViewPort, inViewPort]);

  return <>{renderFlag ? children : skeletonCmp}</>;
};

export default LayLoad;
