import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/models/pixellabs-robot-character-3317.glb");

  return (
    <Center>
      <primitive object={scene} scale={1.2} />
    </Center>
  );
}

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center text-sm text-red-600 bg-white">
          <div className="font-semibold">3D model failed to load</div>
          <div className="mt-1 text-xs text-zinc-600">
            Check file path: <span className="font-mono">/models/pixellabs-robot-character-3317.glb</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Avatar3D() {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-red-50 p-4 shadow-sm">
      <div className="h-[360px] sm:h-[420px] w-full rounded-2xl overflow-hidden bg-zinc-50">
        <ModelErrorBoundary>
          <Canvas camera={{ position: [0, 1.3, 3.2], fov: 45 }}>
            {/* ✅ lights */}
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 5, 5]} intensity={1.4} />
            <directionalLight position={[-5, 3, 2]} intensity={0.8} />

            {/* ✅ Suspense should be INSIDE Canvas */}
            <Suspense
              fallback={
                <mesh>
                  <boxGeometry args={[0.8, 0.8, 0.8]} />
                  <meshStandardMaterial />
                </mesh>
              }
            >
              <Model />
              <Environment preset="studio" />
            </Suspense>

            <OrbitControls
              enablePan={false}
              enableZoom={true}
              autoRotate
              autoRotateSpeed={10.0}
            />
          </Canvas>
        </ModelErrorBoundary>
      </div>
    </div>
  );
}

useGLTF.preload("/models/pixellabs-robot-character-3317.glb");