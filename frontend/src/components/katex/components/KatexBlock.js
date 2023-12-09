import React, { useState } from "react";
import katex from "katex";
import KatexOutput from "./KatexOutput"; 
export default (props) => {
  const { block, blockProps } = props;
  const { getEditorState } = blockProps;

  const contentState = getEditorState().getCurrentContent();
 

  const data = contentState.getEntity(block.getEntityAt(0)).getData();

  const [isEditing, setIsEditing] = useState(false);
  const [isInvalidTex, setIsInvalidTex] = useState(false);
  const [value, setValue] = useState(data.value);

 

  const displayMode = <KatexOutput value={value} />;

  return  displayMode;
};
