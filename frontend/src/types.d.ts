import { Object3D } from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any
      planeGeometry: any
      cylinderGeometry: any
      circleGeometry: any
      meshStandardMaterial: any
      ambientLight: any
      directionalLight: any
      pointLight: any
      gridHelper: any
    }
  }
} 