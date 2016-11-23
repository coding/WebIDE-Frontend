export const MARKDOWN_EDITOR_RESIZE = 'EDITOR_RESIZE';
export const MARKDOWN_EDITOR_TOGGLE_PREVIEW = 'MARKDOWN_EDITOR_TOGGLE_PREVIEW';
export const MARKDOWN_EDITOR_TOGGLE_SIZE = 'MARKDOWN_EDITOR_TOGGLE_SIZE';


export const editorResize = (item, dX, dY) => {
  return ({
    type: MARKDOWN_EDITOR_RESIZE,
    payload: {
      dX, 
      dY
    },
  });
}

export const togglePreview = () => {
  return ({
    type: MARKDOWN_EDITOR_TOGGLE_PREVIEW
  });
};

export const togglePreviewSize = () => {
  return ({
    type: MARKDOWN_EDITOR_TOGGLE_SIZE
  });
};
