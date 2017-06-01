const getLength = (p1, p2) => Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2))

export default function roundVertices (data) {
  const DI = 3
  const dataLength = data.length
  if (dataLength >= 3) {
    return data.reduce((acc, currentPoint, index, data) => {
      // first and last point, noop
      if (index === 0 || dataLength - 1 === index) {
        acc.push(currentPoint)
      } else {
        const prevPoint = data[index - 1]
        const nextPoint = data[index + 1]
        const [x_p, y_p] = prevPoint
        const [x_n, y_n] = nextPoint
        const [x_c, y_c] = currentPoint

        const r_cp = getLength(currentPoint, prevPoint)
        const r_cn = getLength(currentPoint, nextPoint)

        const unitVec_cp = [(x_p - x_c) / r_cp, (y_p - y_c) / r_cp]
        const unitVec_cn = [(x_n - x_c) / r_cn, (y_n - y_c) / r_cn]

        const curveStartPoint = [unitVec_cp[0] * DI + x_c, unitVec_cp[1] * DI + y_c]
        const curveEndPoint = [unitVec_cn[0] * DI + x_c, unitVec_cn[1] * DI + y_c]

        acc.push([curveStartPoint, currentPoint, curveEndPoint])
      }

      return acc
    }, [])
  } else {
    return data
  }
}
