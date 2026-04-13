import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGameStore } from '../../store/gameStore';
import { ELEMENT_COLORS, ELEMENT_TEXT_COLORS, PALETTE_ELEMENTS, primaryValence } from '@molecule-master/shared';
import AtomNode from '../build/AtomNode';
import BondEdge from '../build/BondEdge';
import Button from '../shared/Button';
import Card from '../shared/Card';

const nodeTypes: NodeTypes = { atom: AtomNode };
const edgeTypes: EdgeTypes = { bond: BondEdge };

let nextId = 1;

export default function BuildMode() {
  const currentBuildChallenge = useGameStore((s) => s.currentBuildChallenge);
  const validationResult = useGameStore((s) => s.validationResult);
  const feedbackMessage = useGameStore((s) => s.feedbackMessage);
  const feedbackType = useGameStore((s) => s.feedbackType);
  const updateBuildGraph = useGameStore((s) => s.updateBuildGraph);
  const submitBuild = useGameStore((s) => s.submitBuild);
  const skipChallenge = useGameStore((s) => s.skipChallenge);
  const loadNextBuildChallenge = useGameStore((s) => s.loadNextBuildChallenge);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Use a ref to track the latest nodes/edges for syncing
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  // Debounced sync to store for validation
  const syncTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const scheduleSync = useCallback(() => {
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      updateBuildGraph({
        atoms: currentNodes.map((n) => ({
          id: n.id,
          element: n.data.element as string,
          x: n.position.x,
          y: n.position.y,
        })),
        bonds: currentEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          order: (e.data?.order ?? 1) as 1 | 2 | 3,
        })),
      });
    }, 50);
  }, [updateBuildGraph]);

  // Sync when nodes or edges change
  useEffect(() => {
    scheduleSync();
  }, [nodes, edges, scheduleSync]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `e-${nextId++}`,
        type: 'bond',
        data: { order: 1 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const addAtom = (element: string) => {
    const id = `atom-${nextId++}`;
    const newNode: Node = {
      id,
      type: 'atom',
      position: { x: 150 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: {
        element,
        color: ELEMENT_COLORS[element] ?? '#888',
        textColor: ELEMENT_TEXT_COLORS[element] ?? '#fff',
        valence: primaryValence(element),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === edge.id) {
            const currentOrder = (e.data?.order as number) ?? 1;
            const newOrder = currentOrder >= 3 ? 1 : currentOrder + 1;
            return { ...e, data: { ...e.data, order: newOrder } };
          }
          return e;
        })
      );
    },
    [setEdges]
  );

  // Update node data with validation status
  const nodesWithValidation = useMemo(() => {
    if (!validationResult) return nodes;
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        status: validationResult.atomStatuses?.[n.id],
      },
    }));
  }, [nodes, validationResult]);

  const handleSubmit = async () => {
    const correct = await submitBuild();
    if (correct) {
      setTimeout(() => {
        setNodes([]);
        setEdges([]);
        loadNextBuildChallenge();
      }, 2500);
    }
  };

  const handleSkip = () => {
    setNodes([]);
    setEdges([]);
    skipChallenge();
  };

  if (!currentBuildChallenge) {
    return <div className="flex-1 flex items-center justify-center text-text-dim">Loading challenge...</div>;
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-4 gap-4 overflow-hidden">
      {/* Challenge prompt */}
      <div className="flex items-center justify-between shrink-0">
        <Card className="px-4 py-3 flex items-center gap-4">
          <div>
            <div className="text-xs text-text-dim uppercase tracking-wider">Build</div>
            <div className="text-lg font-bold text-text-main">
              {currentBuildChallenge.targetName}
              <span className="ml-2 text-accent font-mono text-sm">
                ({currentBuildChallenge.targetFormula})
              </span>
            </div>
            {currentBuildChallenge.hint && (
              <div className="text-xs text-text-dim mt-1">{currentBuildChallenge.hint}</div>
            )}
          </div>
          {/* Reference image */}
          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
            <img
              src={`/api/molecules/${currentBuildChallenge.targetCid}/image`}
              alt="Target"
              className="w-full h-full object-contain p-1"
            />
          </div>
        </Card>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={nodes.length === 0}>
            Check
          </Button>
          <Button variant="danger" size="sm" onClick={handleSkip}>
            Skip
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {feedbackMessage && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium text-center shrink-0 ${
            feedbackType === 'correct'
              ? 'bg-good/20 text-good border border-good/30'
              : feedbackType === 'partial'
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-bad/20 text-bad border border-bad/30'
          }`}
        >
          {feedbackMessage}
        </div>
      )}

      {/* Builder canvas */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Atom palette */}
        <div className="flex flex-col gap-2 py-2 shrink-0">
          <div className="text-xs text-text-dim uppercase tracking-wider text-center mb-1">Atoms</div>
          {PALETTE_ELEMENTS.map((el) => (
            <button
              key={el}
              onClick={() => addAtom(el)}
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all hover:scale-110 active:scale-95 border-2 border-transparent hover:border-accent/50"
              style={{
                backgroundColor: ELEMENT_COLORS[el] + '40',
                color: ELEMENT_COLORS[el],
              }}
              title={`Add ${el} atom (valence: ${primaryValence(el)})`}
            >
              {el}
            </button>
          ))}
        </div>

        {/* React Flow canvas */}
        <div className="flex-1 bg-inset rounded-2xl border border-card-border overflow-hidden">
          <ReactFlow
            nodes={nodesWithValidation}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={handleEdgeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            deleteKeyCode={["Backspace", "Delete"]}
            className="bg-transparent"
          >
            <Background color="#343c52" gap={20} size={1} />
            <Controls
              showInteractive={false}
              className="!bg-card !border-card-border !rounded-xl"
            />
            <Panel position="bottom-center" className="!bg-transparent">
              <div className="flex items-center gap-4 text-xs text-text-dim bg-card/80 backdrop-blur px-4 py-2 rounded-xl border border-card-border">
                <span>Click palette to add atoms</span>
                <span>Drag between atoms to bond</span>
                <span>Click bond to cycle single/double/triple</span>
                <span>Backspace to remove selected</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Validation panel */}
        {validationResult && nodes.length > 0 && (
          <div className="w-48 flex flex-col gap-2 py-2 overflow-y-auto shrink-0">
            <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Validation</div>
            <div className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              validationResult.complete
                ? 'bg-good/20 text-good'
                : validationResult.valid
                  ? 'bg-gold/20 text-gold'
                  : 'bg-bad/20 text-bad'
            }`}>
              {validationResult.complete
                ? 'All valences satisfied!'
                : validationResult.valid
                  ? 'Valid so far...'
                  : `${validationResult.errors.length} error(s)`}
            </div>

            <div className="text-xs text-text-dim">
              Formula: <span className="font-mono text-text-main">{validationResult.formula || '—'}</span>
            </div>

            {validationResult.errors.map((err, i) => (
              <div key={i} className="text-xs text-bad bg-bad/10 rounded-lg px-2 py-1.5">
                {err.message}
              </div>
            ))}
            {validationResult.warnings.map((warn, i) => (
              <div key={i} className="text-xs text-gold bg-gold/10 rounded-lg px-2 py-1.5">
                {warn.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
