export function buildBezierPath(temps, width = 700, height = 120, padX = 44, padY = 10) {
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;
  const n = temps.length;

  const points = temps.map((t, i) => ({
    x: padX + (i / (n - 1)) * (width - padX * 2),
    y: padY + (1 - (t - minT) / range) * (height - padY * 2),
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
    d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const fillD = `${d} L ${points[n - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const ySteps = [maxT, Math.round((maxT + minT) / 2), minT];

  return { path: d, fillPath: fillD, points, minT, maxT, range, ySteps };
}
