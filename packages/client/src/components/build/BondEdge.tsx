import { BaseEdge, getStraightPath, type EdgeProps } from '@xyflow/react';

export default function BondEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps) {
  const order = ((data as Record<string, unknown>)?.order as number) ?? 1;
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  // Calculate perpendicular offset for multi-bond rendering
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len; // normal x
  const ny = dx / len;  // normal y
  const offset = 4;

  const color = selected ? '#14b8a6' : '#8a92a6';
  const strokeWidth = selected ? 3 : 2;

  if (order === 1) {
    return (
      <BaseEdge
        id={id}
        path={path}
        style={{ stroke: color, strokeWidth }}
      />
    );
  }

  if (order === 2) {
    const path1 = `M ${sourceX + nx * offset} ${sourceY + ny * offset} L ${targetX + nx * offset} ${targetY + ny * offset}`;
    const path2 = `M ${sourceX - nx * offset} ${sourceY - ny * offset} L ${targetX - nx * offset} ${targetY - ny * offset}`;
    return (
      <g>
        <path d={path1} stroke={color} strokeWidth={strokeWidth} fill="none" />
        <path d={path2} stroke={color} strokeWidth={strokeWidth} fill="none" />
      </g>
    );
  }

  // Triple bond
  const path1 = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  const path2 = `M ${sourceX + nx * offset * 1.5} ${sourceY + ny * offset * 1.5} L ${targetX + nx * offset * 1.5} ${targetY + ny * offset * 1.5}`;
  const path3 = `M ${sourceX - nx * offset * 1.5} ${sourceY - ny * offset * 1.5} L ${targetX - nx * offset * 1.5} ${targetY - ny * offset * 1.5}`;
  return (
    <g>
      <path d={path1} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <path d={path2} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <path d={path3} stroke={color} strokeWidth={strokeWidth} fill="none" />
    </g>
  );
}
