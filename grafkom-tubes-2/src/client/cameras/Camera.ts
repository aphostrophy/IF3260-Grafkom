import { Object3D } from '@core/Object3D';
import { Matrix4 } from '@math/Matrix4';

class Camera extends Object3D {
  matrixWorldInverse: Matrix4;
  projectionMatrix: Matrix4;
  projectionMatrixInverse: Matrix4;

  constructor() {
    super();
    this.matrixWorldInverse = new Matrix4();

    this.projectionMatrix = new Matrix4();
    this.projectionMatrixInverse = new Matrix4();
  }
}

export { Camera };
