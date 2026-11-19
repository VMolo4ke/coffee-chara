// src/lib/three/SceneManager.ts
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadCoffeeCup } from "./loadModel";

export type CameraView = "default" | "top" | "detail";

export class SceneManager {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private dirLight: THREE.DirectionalLight;
  private controls: OrbitControls;
  private resizeObserver: ResizeObserver;
  private animationFrameId = 0;

  private cupMeshes: THREE.Mesh[] = [];
  private lidMeshes: THREE.Mesh[] = [];
  private originalCupMaps = new Map<THREE.Mesh, THREE.Texture | null>();
  private targetCameraPos = new THREE.Vector3(0, 2.5, 6);

  constructor(private container: HTMLElement) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.copy(this.targetCameraPos);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 8;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.set(1024, 1024);
    this.setLightAngle(45);

    this.scene.add(ambientLight, this.dirLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3, 64),
      new THREE.ShadowMaterial({ opacity: 0.15 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    this.animate();
  }

  async initModel(url: string) {
    const cup = await loadCoffeeCup(url);

    cup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = (child.material as THREE.MeshStandardMaterial).clone();
        const mat = child.material as THREE.MeshStandardMaterial;

        if (child.name.includes("lid")) {
          this.lidMeshes.push(child);
        } else if (child.name.includes("cup")) {
          this.cupMeshes.push(child);
          this.originalCupMaps.set(child, mat.map);
        }
      }
    });

    this.scene.add(cup);
  }

  setLidColor(hex: string) {
    for (const mesh of this.lidMeshes) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.set(hex);
    }
  }

  setCupColor(hex: string | null) {
    for (const mesh of this.cupMeshes) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (hex === null) {
        mat.map = this.originalCupMaps.get(mesh) ?? null;
        mat.color.set("#ffffff");
      } else {
        mat.map = null;
        mat.color.set(hex);
      }
      mat.needsUpdate = true;
    }
  }

  setView(view: CameraView) {
    if (view === "default") this.targetCameraPos.set(0, 1.2, 4);
    if (view === "top") this.targetCameraPos.set(0, 3.8, 1.2);
    if (view === "detail") this.targetCameraPos.set(1.8, 0.3, 2.2);
  }

  setLightAngle(degrees: number) {
    const rad = THREE.MathUtils.degToRad(degrees);
    const radius = 5;
    this.dirLight.position.set(
      Math.cos(rad) * radius,
      5,
      Math.sin(rad) * radius,
    );
  }

  private onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.camera.position.lerp(this.targetCameraPos, 0.08);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
