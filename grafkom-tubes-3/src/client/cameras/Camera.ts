import { Object3D } from '@core/Object3D';
import { Matrix4 } from '@math/Matrix4';

abstract class Camera extends Object3D {
    matrixWorldInverse: Matrix4;
    projectionMatrix: Matrix4;
    projectionMatrixInverse: Matrix4;

    constructor() {
        super();
        this.type = 'camera';
        this.matrixWorldInverse = new Matrix4();

        this.projectionMatrix = new Matrix4();
        this.projectionMatrixInverse = new Matrix4();
    }

    cameraReset() {
        this.position.set(0,0,8);
        this.quaternion.set(0,0,0,1);
        this.scale.set(1,1,1);
        this.modelViewMatrix.identity();
        this.matrix.identity();
        this.matrixWorld.identity();
        this.normalMatrix.identity();
        this.xLocalAxis.set(1,0,0);
        this.yLocalAxis.set(0,1,0);
        this.zLocalAxis.set(0,0,1);
    }
}

export { Camera };
