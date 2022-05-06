import React, { MutableRefObject } from "react";
import ReactImgEditor from '@cloudogu/react-img-editor'
import '@cloudogu/react-img-editor/lib/index.css'


export const createScreenshot = (stageRef: MutableRefObject<any>): { toBlob: () => Promise<Blob | null> } => ({
  toBlob: () => {
    const canvas = stageRef.current.clearAndToCanvas({
      pixelRatio: stageRef.current._pixelRatio,
    }) as HTMLCanvasElement;
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob));
    });
  },
});

export function Editor({ width, height, stageRef, url }) {
  const setStage = (stage: unknown) => {
    stageRef.current = stage;
  };
  return <ReactImgEditor width={width} height={height} getStage={setStage} src={url} />
}
