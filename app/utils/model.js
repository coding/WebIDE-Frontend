export default function (modelConfig) {
  let _Model = function Model (instanceConfig) {
    return {...modelConfig, ...instanceConfig}
  }

  return _Model
}
