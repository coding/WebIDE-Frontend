export const EDITOR_RESIZE = 'EDITOR_RESIZE';

export const editorResize = (item, dX, dY) => {
  return ({
    type: EDITOR_RESIZE,
    payload: {
      dX, 
      dY
    },
  });
}
