/** Connected-dot mesh (plexus-style) — Rok Kru primary palette */

const connect = (nodes, maxDist) => {
  const edges = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i][0] - nodes[j][0]
      const dy = nodes[i][1] - nodes[j][1]
      if (Math.hypot(dx, dy) < maxDist) edges.push([i, j])
    }
  }
  return edges
}

const darkNodes = [
  [6, 14], [18, 8], [34, 20], [52, 10], [72, 16], [90, 28],
  [94, 48], [82, 68], [62, 82], [38, 90], [14, 78], [10, 52],
  [24, 38], [42, 32], [58, 44], [76, 40], [48, 58], [28, 62],
  [66, 24], [44, 18],
]

const lightNodes = [
  [8, 12], [28, 18], [48, 8], [72, 14], [88, 32],
  [92, 58], [70, 78], [42, 88], [16, 72], [12, 42],
  [32, 48], [55, 38], [78, 52], [60, 62], [35, 28],
]

export const meshPresets = {
  /** Login, landing hero — dark bg */
  dark: {
    nodes: darkNodes,
    edges: connect(darkNodes, 36),
    lineColor: 'rgba(232, 188, 195, 0.28)',
    nodeColor: 'rgba(232, 188, 195, 0.55)',
    dotRadius: 0.5,
    layerOpacity: 1,
    anim: 'mesh-drift-slow',
  },
  /** White / slate page backgrounds */
  light: {
    nodes: lightNodes,
    edges: connect(lightNodes, 34),
    lineColor: 'rgba(168, 102, 116, 0.48)',
    nodeColor: 'rgba(192, 120, 136, 0.72)',
    dotRadius: 0.62,
    layerOpacity: 1,
    anim: 'mesh-drift-slow',
  },
  /** Admin panel — cool slate + cyan mesh */
  admin: {
    nodes: [
      [10, 18], [26, 10], [44, 22], [62, 12], [80, 20], [92, 36],
      [88, 58], [72, 74], [50, 82], [28, 76], [12, 58], [14, 38],
      [34, 42], [52, 34], [68, 48], [40, 58], [58, 64],
    ],
    edges: connect(
      [
        [10, 18], [26, 10], [44, 22], [62, 12], [80, 20], [92, 36],
        [88, 58], [72, 74], [50, 82], [28, 76], [12, 58], [14, 38],
        [34, 42], [52, 34], [68, 48], [40, 58], [58, 64],
      ],
      32
    ),
    lineColor: 'rgba(100, 116, 139, 0.38)',
    nodeColor: 'rgba(34, 211, 238, 0.58)',
    dotRadius: 0.55,
    layerOpacity: 0.9,
    anim: 'admin-mesh-drift',
  },
}
