import Backoff from 'backo2'

const defaultConfig = {
  delayMin: 1500,
  delayMax: 10000,
}

export default function getBackoff (config={}) {
  config = { ...defaultConfig, ...config }
  const backoff = new Backoff({
    min: config.delayMin,
    max: config.delayMax,
    jitter: 0.5,
  })

  return backoff
}
