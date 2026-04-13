import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { AtomStatus } from '@molecule-master/shared';

interface AtomNodeData {
  element: string;
  color: string;
  textColor: string;
  valence: number;
  status?: AtomStatus;
  [key: string]: unknown;
}

export default function AtomNode({ data, selected }: NodeProps) {
  const { element, color, textColor, valence, status } = data as unknown as AtomNodeData;

  let ringColor = '#343c52'; // default border
  if (status) {
    if (status.overBonded) ringColor = '#f87171'; // bad - red
    else if (status.satisfied) ringColor = '#34d399'; // good - green
    else if (status.currentBonds > 0) ringColor = '#f5b841'; // gold - incomplete
  }

  return (
    <div className="relative group">
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-accent !border-2 !border-card" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-accent !border-2 !border-card" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-accent !border-2 !border-card" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-accent !border-2 !border-card" />

      {/* Atom circle */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 ${
          selected ? 'scale-110' : ''
        }`}
        style={{
          backgroundColor: color,
          color: textColor,
          boxShadow: `0 0 0 3px ${ringColor}, 0 0 ${status?.overBonded ? '12px' : '0px'} ${ringColor}40`,
        }}
      >
        {element}
      </div>

      {/* Valence indicator */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-text-dim font-mono whitespace-nowrap">
        {status ? `${status.currentBonds}/${status.requiredBonds}` : `0/${valence}`}
      </div>
    </div>
  );
}
