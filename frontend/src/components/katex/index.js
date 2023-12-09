import { EditorState } from "draft-js";
import { KATEX_ENTITY } from "./entity";
import control from "./control";
import KatexBlock from "./components/KatexBlock";
import removeTexBlock from "./modifiers/removeTexBlock";

export default (config) => {
  const blocksInEditingMode = new Map();

  return {
    blockRendererFn: (
      block,
      { getEditorState, setEditorState, setReadOnly }
    ) => { 
      if (block.getType() !== "atomic") return null;
      const contentState = getEditorState().getCurrentContent();
      const entity = block.getEntityAt(0);
      if (!entity) return null;
      const type = contentState.getEntity(entity).getType();
    //   if (type !== KATEX_ENTITY) return null;

      return {
        component: KatexBlock,
        editable: false,
        props: {
          getEditorState,

          onStartEdit: (blockKey) => {
            setReadOnly(true);
            blocksInEditingMode.set(blockKey, true);
          },

          onFinishEdit: (blockKey, newEditorState) => {
            setReadOnly(false);
            blocksInEditingMode.delete(blockKey);
            setEditorState(
              EditorState.forceSelection(
                newEditorState,
                newEditorState.getSelection()
              )
            );
          },

          onRemove: (blockKey) => {
            setReadOnly(false);  

            blocksInEditingMode.delete(blockKey);
            const editorState = getEditorState();
            const newEditorState = removeTexBlock(editorState, blockKey);
            setEditorState(newEditorState);
          }
        }
      };
    },
    control,
    entityType: {
      type: KATEX_ENTITY
    }
  };
};
