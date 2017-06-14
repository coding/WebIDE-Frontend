export default function (modelConfig) {
  const _Model = function Model (instanceConfig) {
    return { ...modelConfig, ...instanceConfig }
  }

  return _Model
}
