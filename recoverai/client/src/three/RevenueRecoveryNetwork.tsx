import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Bot, Shield, AlertCircle, RefreshCw, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

interface NodeData {
  id: string;
  name: string;
  sub: string;
  position: [number, number, number];
  color: string;
  size: number;
  description: string;
  metric: string;
}

const NODES: NodeData[] = [
  {
    id: 'failed',
    name: 'Failed Payments',
    sub: 'Detection Layer',
    position: [-4.2, 1.8, 0],
    color: '#ef4444',
    size: 0.6,
    description: 'Autonomous ingestion of payment webhooks and gateway errors in real time.',
    metric: '10,000 Detected',
  },
  {
    id: 'agent',
    name: 'RecoverAI Agent',
    sub: 'Central Orchestration',
    position: [0, 0, 0],
    color: '#10b981',
    size: 0.9,
    description: 'Central AI reasoning system analyzing failure patterns and customer context.',
    metric: 'Autonomous Core',
  },
  {
    id: 'diagnosis',
    name: 'AI Diagnosis',
    sub: 'Failure Classification',
    position: [-2.0, -2.0, 1.2],
    color: '#a855f7',
    size: 0.65,
    description: 'Classifies failure root cause (Bank Timeout, Card Decline, Limit, etc.).',
    metric: '99.4% Accuracy',
  },
  {
    id: 'risk',
    name: 'Risk Engine',
    sub: 'Scoring (0-100)',
    position: [2.0, -2.0, 1.2],
    color: '#f59e0b',
    size: 0.65,
    description: 'Deterministic 0-100 risk scoring based on history, method, amount & age.',
    metric: 'Deterministic Risk',
  },
  {
    id: 'policy',
    name: 'Policy Engine',
    sub: 'Hard Guardrails',
    position: [2.2, 1.8, -1.0],
    color: '#38bdf8',
    size: 0.7,
    description: 'Immutable financial safety checks: retry limits, high-value thresholds & idempotency.',
    metric: 'Zero Unauthorized',
  },
  {
    id: 'recovery',
    name: 'Recovery Action',
    sub: 'Smart Retries & Routing',
    position: [-1.8, 2.4, -1.0],
    color: '#34d399',
    size: 0.65,
    description: 'Executes permitted actions: optimal retry timing, reminders, or method change.',
    metric: '1,446 Executed',
  },
  {
    id: 'verification',
    name: 'Verification',
    sub: 'Outcome Confirmation',
    position: [4.2, 0.4, 0.5],
    color: '#06b6d4',
    size: 0.65,
    description: 'Cryptographic simulation verification and balance reconciliation.',
    metric: 'Real-time Verify',
  },
  {
    id: 'revenue',
    name: 'Recovered Revenue',
    sub: 'Financial Impact',
    position: [5.2, -2.2, -0.5],
    color: '#10b981',
    size: 0.85,
    description: 'Net positive revenue recovered and added back to merchant balance.',
    metric: '₹5,91,250+ Recovered',
  },
];

const CONNECTIONS: [string, string][] = [
  ['failed', 'agent'],
  ['agent', 'diagnosis'],
  ['diagnosis', 'risk'],
  ['risk', 'policy'],
  ['policy', 'agent'],
  ['agent', 'recovery'],
  ['recovery', 'verification'],
  ['verification', 'revenue'],
];

// ─── 3D Node Mesh ─────────────────────────────────────────────────────────────

function NetworkNode({
  node,
  isSelected,
  onSelect,
}: {
  node: NodeData;
  isSelected: boolean;
  onSelect: (node: NodeData) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const t = state.clock.getElapsedTime();
      if (node.id === 'agent') {
        meshRef.current.scale.setScalar(
          node.size * (1 + Math.sin(t * 2) * 0.08)
        );
      }
    }
  });

  return (
    <group position={node.position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Core Sphere / Octahedron for Agent */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          {node.id === 'agent' ? (
            <octahedronGeometry args={[node.size, 2]} />
          ) : (
            <sphereGeometry args={[node.size, 32, 32]} />
          )}
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={isSelected || hovered ? 0.9 : 0.45}
            roughness={0.2}
            metalness={0.8}
            wireframe={node.id === 'policy'}
          />
        </mesh>

        {/* Outer Glow Halo Ring */}
        <mesh>
          <ringGeometry args={[node.size * 1.25, node.size * 1.35, 32]} />
          <meshBasicMaterial
            color={node.color}
            side={THREE.DoubleSide}
            transparent
            opacity={isSelected || hovered ? 0.8 : 0.25}
          />
        </mesh>

        {/* Label text */}
        <Text
          position={[0, -node.size - 0.35, 0]}
          fontSize={0.28}
          color="#f1f5f9"
          anchorX="center"
          anchorY="top"
        >
          {node.name}
        </Text>
        <Text
          position={[0, -node.size - 0.7, 0]}
          fontSize={0.18}
          color="#94a3b8"
          anchorX="center"
          anchorY="top"
        >
          {node.sub}
        </Text>
      </Float>
    </group>
  );
}

// ─── Connecting Lines with Moving Particles ───────────────────────────────────

function NetworkConnections({ selectedId }: { selectedId: string | null }) {
  const lineObjects = useMemo(() => {
    const nodeMap = new Map(NODES.map((n) => [n.id, n.position]));
    return CONNECTIONS.map(([startId, endId]) => {
      const p1 = nodeMap.get(startId);
      const p2 = nodeMap.get(endId);
      if (!p1 || !p2) return null;
      const points = [new THREE.Vector3(...p1), new THREE.Vector3(...p2)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const isHighlighted =
        selectedId === startId ||
        selectedId === endId ||
        selectedId === 'agent';
      const material = new THREE.LineBasicMaterial({
        color: isHighlighted ? '#10b981' : '#1e382b',
        linewidth: isHighlighted ? 2 : 1,
        transparent: true,
        opacity: isHighlighted ? 0.85 : 0.4,
      });
      return new THREE.Line(geometry, material);
    }).filter(Boolean) as THREE.Line[];
  }, [selectedId]);

  return (
    <group>
      {lineObjects.map((lineObj, idx) => (
        <primitive key={idx} object={lineObj} />
      ))}
    </group>
  );
}

// ─── Ambient Particle Cloud ───────────────────────────────────────────────────

function ParticleField() {
  const count = 120;
  const particles = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 16;
      pos[i + 1] = (Math.random() - 0.5) * 10;
      pos[i + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#10b981"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Fallback 2D Topology Diagram ─────────────────────────────────────────────

function Fallback2DNetwork({
  selectedNode,
  onSelectNode,
}: {
  selectedNode: NodeData | null;
  onSelectNode: (node: NodeData) => void;
}) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-br from-background-secondary via-background-card to-background-surface rounded-xl border border-background-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Recovery Pipeline Flow
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
          2D Topology Active
        </span>
      </div>

      {/* Grid of connected flow stages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {NODES.map((node) => {
          const isSel = selectedNode?.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node)}
              className={`p-3 rounded-xl text-left transition-all border ${
                isSel
                  ? 'bg-emerald-950/50 border-emerald-500 shadow-glow-sm'
                  : 'bg-background-surface/80 border-background-border hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-[10px] font-mono text-slate-400">
                  {node.sub}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200">{node.name}</p>
              <p className="text-[11px] text-emerald-400/90 font-mono mt-1">
                {node.metric}
              </p>
            </button>
          );
        })}
      </div>

      <div className="text-[11px] text-slate-400 text-center">
        Click any stage to inspect autonomous parameters and guardrails
      </div>
    </div>
  );
}

// ─── Main 3D Component with Error Boundary / Fallback ─────────────────────────

export const RevenueRecoveryNetwork: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<NodeData>(NODES[1]); // default RecoverAI Agent
  const [hasWebGLError, setHasWebGLError] = useState(false);

  return (
    <div className="relative w-full h-[440px] rounded-2xl glass-card border border-emerald-900/40 overflow-hidden flex flex-col">
      {/* Top overlay banner */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-background-secondary/90 border border-emerald-800/50 text-[11px] font-mono text-emerald-300 backdrop-blur-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>AUTONOMOUS RECOVERY NETWORK</span>
        </div>
      </div>

      {/* Top right instructions */}
      <div className="absolute top-4 right-4 z-10 text-[11px] text-slate-400 font-mono hidden sm:block bg-background-secondary/80 px-2.5 py-1 rounded-md border border-background-border backdrop-blur-md">
        Drag to rotate • Scroll to zoom • Click node to inspect
      </div>

      {/* 3D Canvas or 2D Fallback */}
      <div className="flex-1 w-full h-full">
        {!hasWebGLError ? (
          <Canvas
            camera={{ position: [0, 0, 9.5], fov: 45 }}
            onCreated={({ gl }) => {
              gl.setClearColor(new THREE.Color('#050807'));
            }}
            onError={() => setHasWebGLError(true)}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.2} color="#10b981" />
            <pointLight position={[-10, -10, -10]} intensity={0.8} color="#06b6d4" />
            <pointLight position={[0, 0, 5]} intensity={0.5} color="#a855f7" />

            <Suspense fallback={null}>
              <ParticleField />
              <NetworkConnections selectedId={selectedNode?.id || null} />

              {NODES.map((node) => (
                <NetworkNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNode?.id === node.id}
                  onSelect={setSelectedNode}
                />
              ))}

              <OrbitControls
                enablePan={false}
                minDistance={6}
                maxDistance={14}
                autoRotate
                autoRotateSpeed={0.6}
              />
            </Suspense>
          </Canvas>
        ) : (
          <Fallback2DNetwork
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
          />
        )}
      </div>

      {/* Bottom Node Inspector Bar */}
      {selectedNode && (
        <div className="p-3.5 bg-background-secondary/95 border-t border-background-border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: selectedNode.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">
                  {selectedNode.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedNode.sub}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedNode.description}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-800/40">
              {selectedNode.metric}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
