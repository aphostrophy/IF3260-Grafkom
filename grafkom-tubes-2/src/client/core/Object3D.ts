import { Quaternion } from '@math/Quaternion';
import { Vector3 } from '@math/Vector3';
import { Matrix4 } from '@math/Matrix4';
import { Matrix3 } from '@math/Matrix3';
import { Camera } from '@cameras/Camera';

const _v1 = /*@__PURE__*/ new Vector3();
const _q1 = /*@__PURE__*/ new Quaternion();
const _m1 = /*@__PURE__*/ new Matrix4();
const _target = /*@__PURE__*/ new Vector3();

const _position = /*@__PURE__*/ new Vector3();

const _xAxis = /*@__PURE__*/ new Vector3(1, 0, 0);
const _yAxis = /*@__PURE__*/ new Vector3(0, 1, 0);
const _zAxis = /*@__PURE__*/ new Vector3(0, 0, 1);

class Object3D {
  static _object3DId = 0;
  static DefaultUp = new Vector3(0, 1, 0);
  static DefaultMatrixAutoUpdate = true;

  id: number;

  name: string;

  type: string;

  up: Vector3;

  readonly position: Vector3;

  readonly quaternion: Quaternion;

  readonly scale: Vector3;

  readonly modelViewMatrix: Matrix4;

  normalMatrix: Matrix3;

  matrix: Matrix4;

  matrixWorld: Matrix4;

  constructor() {
    this.id = Object3D._object3DId;

    this.name = '';
    this.type = 'Object3D';

    this.up = Object3D.DefaultUp.clone();

    this.position = new Vector3();
    this.quaternion = new Quaternion();
    this.scale = new Vector3(1, 1, 1);

    this.modelViewMatrix = new Matrix4();
    this.normalMatrix = new Matrix3();

    this.matrix = new Matrix4();
    this.matrixWorld = new Matrix4();
  }

  applyMatrix4(matrix: Matrix4) {
    this.updateMatrix();

    this.matrix.premultiply(matrix);

    this.matrix.decompose(this.position, this.quaternion, this.scale);
  }

  applyQuaternion(q: Quaternion) {
    this.quaternion.premultiply(q);

    return this;
  }

  setRotationFromAxisAngle(axis: Vector3, angle: number) {
    // assumes axis is normalized

    this.quaternion.setFromAxisAngle(axis, angle);
  }

  setRotationFromMatrix(m: Matrix4) {
    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    this.quaternion.setFromRotationMatrix(m);
  }

  setRotationFromQuaternion(q: Quaternion) {
    // assumes q is normalized

    this.quaternion.copy(q);
  }

  rotateOnAxis(axis: Vector3, angle: number) {
    // rotate object on axis in object space
    // axis is assumed to be normalized

    _q1.setFromAxisAngle(axis, angle);

    this.quaternion.multiply(_q1);

    return this;
  }

  rotateX(angle: number) {
    return this.rotateOnAxis(_xAxis, angle);
  }

  rotateY(angle: number) {
    return this.rotateOnAxis(_yAxis, angle);
  }

  rotateZ(angle: number) {
    return this.rotateOnAxis(_zAxis, angle);
  }

  translateOnAxis(axis: Vector3, distance: number) {
    // translate object by distance along axis in object space
    // axis is assumed to be normalized

    _v1.copy(axis);

    this.position.add(_v1.multiplyScalar(distance));

    return this;
  }

  translateX(distance: number) {
    return this.translateOnAxis(_xAxis, distance);
  }

  translateY(distance: number) {
    return this.translateOnAxis(_yAxis, distance);
  }

  translateZ(distance: number) {
    return this.translateOnAxis(_zAxis, distance);
  }

  lookAt(x: Vector3 | number, y?: number, z?: number) {
    this.updateMatrix();
    if (x instanceof Vector3) {
      _target.copy(x);
    } else if (y !== undefined && z !== undefined) {
      _target.set(x, y, z);
    }

    _position.setFromMatrixPosition(this.matrixWorld);
    _position.applyQuaternion(this.quaternion);

    if (this instanceof Camera) {
      this.modelViewMatrix.lookAt(_position, _target, this.up);
    } else {
      _m1.lookAt(_target, _position, this.up);
    }
  }

  updateMatrix() {
    this.matrixWorld.compose(this.position, this.quaternion, this.scale);
  }
}

export { Object3D, _position, _target };
