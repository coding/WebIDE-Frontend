// export const EDITOR_RESIZE = 'EDITOR_RESIZE';

export const editorResize = (dX, dY) => ({
  type: 'EDITOR_RESIZE',
  payload: {
    dX, 
    dY
  },
});
