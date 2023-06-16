import { Camera } from './Camera';
import { MathUtils } from '@math/MathUtils';

class PerspectiveCamera extends Camera {
  zoom: number;

  fov: number;

  aspect: number;

  near: number;

  far: number;

  focus: number;

  filmGauge: number;

  filmOffset: number;

  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
    super();

    this.fov = fov;
    this.zoom = 1;

    this.near = near;
    this.far = far;
    this.focus = 10;

    this.aspect = aspect;

    this.filmGauge = 35;
    this.filmOffset = 0;

    this.updateProjectionMatrix();
  }

  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }

  updateProjectionMatrix() {
    const near = this.near;
    let top = (near * Math.tan(MathUtils.DEG2RAD * 0.5 * this.fov)) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = -0.5 * width;

    const skew = this.filmOffset;
    if (skew !== 0) left += (near * skew) / this.getFilmWidth();

    this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far);

    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
}

export { PerspectiveCamera };
