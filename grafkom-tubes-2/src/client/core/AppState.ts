import { DOMManager } from '@core/DOMManager';
import { GlUtils } from '@libs/GlUtils';
import { Matrix4 } from '@math/Matrix4';
import { PerspectiveCamera } from '@cameras/PerspectiveCamera';
import FragmentShaderSource from '../shaders/FragmentShader.glsl';
import VertexShaderSource from '../shaders/VertexShader.glsl';
import { Camera } from '@cameras/Camera';
import { setupListeners } from './Listener';
import { getOblique, getOrtho } from '@libs/Projections';
import { Vector3 } from '@math/Vector3';
import { Quaternion } from '@math/Quaternion';

class AppState {
  domManager: DOMManager;
  gl: WebGLRenderingContext;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;
  camera: Camera;
  isShaded: number;
  worldMatrix: Matrix4;

  position: Vector3;
  thetaX: number;
  thetaY: number;
  scale: Vector3;

  projection: number;

  objVertices: number[];
  objIndices: number[];
  objColors: number[];

  constructor(obj: any) {
    this.domManager = new DOMManager();
    this.gl = this.domManager.getGl();

    this.vertexShader = GlUtils.getShader(this.gl, this.gl.VERTEX_SHADER, VertexShaderSource);
    this.fragmentShader = GlUtils.getShader(this.gl, this.gl.FRAGMENT_SHADER, FragmentShaderSource);
    this.program = GlUtils.createProgram(this.gl, this.vertexShader, this.fragmentShader);

    this.worldMatrix = new Matrix4();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

    this.projection = 1;

    this.isShaded = 1;

    this.position = new Vector3();
    this.thetaX = 0;
    this.thetaY = 0;
    this.scale = new Vector3(1, 1, 1);

    // Setting the vertices, indices, and colors for object
    this.objVertices = obj.vertices;
    this.objIndices = obj.indices;
    this.objColors = obj.colors;
    setupListeners(this);
  }

  setupCanvas() {
    const gl = this.gl;
    (this.domManager.canvas as HTMLCanvasElement).width = window.innerWidth;
    (this.domManager.canvas as HTMLCanvasElement).height = window.innerHeight;
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
  }

  run() {
    this.setupCanvas();

    const { gl, program } = this;

    const positionAttribLocation = gl.getAttribLocation(program, 'a_position');
    const colorAttribLocation = gl.getAttribLocation(program, 'a_color');
    const normalAttribLocation = gl.getAttribLocation(program, 'normal');

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.objVertices), gl.STATIC_DRAW);

    const faceColors = this.objColors;

    var colors: number[] = new Array();
    for (var j = 0; j < faceColors.length; j += 4) {
      for (var i = 0; i < 4; i++) {
        colors.push(faceColors[j]);
        colors.push(faceColors[j + 1]);
        colors.push(faceColors[j + 2]);
        colors.push(faceColors[j + 3]);
      }
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.objIndices), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    const normalVertices = new Float32Array(this.objIndices);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normalVertices, gl.STATIC_DRAW);

    gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalAttribLocation);

    // Tell OpenGL state machine which program should be active.
    gl.useProgram(program);

    const matWorldUniformLocation = gl.getUniformLocation(program, 'u_model_matrix');
    const matViewUniformLocation = gl.getUniformLocation(program, 'u_view_matrix');
    const matProjUniformLocation = gl.getUniformLocation(program, 'u_proj_matrix');
    const matNormUniformLocation = gl.getUniformLocation(program, 'u_normal_matrix');

    const camera = this.camera;
    camera.position.set(0, 0, -8);
    camera.lookAt(0, 0, 0);

    var normalMatrix = camera.modelViewMatrix.clone().invert().transpose();

    gl.uniformMatrix4fv(matWorldUniformLocation, false, this.worldMatrix.toArray());
    gl.uniformMatrix4fv(matViewUniformLocation, false, camera.modelViewMatrix.toArray());
    gl.uniformMatrix4fv(matProjUniformLocation, false, camera.projectionMatrix.toArray());
    gl.uniformMatrix4fv(matNormUniformLocation, false, normalMatrix.toArray());

    //
    // Main render loop
    //
    requestAnimationFrame(this.render.bind(this));
  }

  resetState() {
    this.scale = new Vector3(1, 1, 1);
    this.position = new Vector3();
    this.thetaX = 0;
    this.thetaY = 0;
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, -8);
    this.camera.lookAt(0, 0, 0);
    this.setupCanvas();
  }

  render() {
    const { gl, camera, program } = this;
    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    const normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
    const shadingStatus = gl.getUniformLocation(program, 'shading');
    const shadingMode = gl.getUniformLocation(program, 'mode');
    const ka = gl.getUniformLocation(program, 'Ka');
    const kd = gl.getUniformLocation(program, 'Kd');
    const ks = gl.getUniformLocation(program, 'Ks');
    const shineVal = gl.getUniformLocation(program, 'shininessVal');
    const ac = gl.getUniformLocation(program, 'ambientColor');
    const dc = gl.getUniformLocation(program, 'diffuseColor');
    const sc = gl.getUniformLocation(program, 'specularColor');
    const lightPos = gl.getUniformLocation(program, 'lightPos');

    this.camera.lookAt(0, 0, 0);

    const xRotationMatrix = new Matrix4();
    const yRotationMatrix = new Matrix4();

    xRotationMatrix.makeRotationX(this.thetaX);
    yRotationMatrix.makeRotationY(this.thetaY);

    this.worldMatrix.multiplyMatrices(xRotationMatrix, yRotationMatrix);
    this.worldMatrix.setPosition(this.position);
    this.worldMatrix.scale(this.scale);

    if (this.projection == 1) {
      // this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    } else if (this.projection == 2) {
      // Orthographic projection
      var ortho = new Matrix4();
      this.camera.projectionMatrix = getOrtho(
        -5.0,
        2.0,
        -5.0,
        2.0,
        0.1,
        100,
        this.camera.projectionMatrix
      );
    } else {
      // Oblique projection
      var oblique = new Matrix4();
      var ortho = new Matrix4();
      oblique = getOblique(oblique, -45, -45);
      ortho = getOrtho(-5.0, 2.0, -5.0, 2.0, 0.1, 100, ortho);
      var temp = oblique.multiply(ortho);

      var mTranslate = new Matrix4().makeTranslation(3, 3, 3);
      this.camera.projectionMatrix = temp.multiply(mTranslate);
    }
    
    const normalMatrix = camera.modelViewMatrix.clone().invert().transpose();

    const matWorldUniformLocation = gl.getUniformLocation(program, 'u_model_matrix');
    const matViewUniformLocation = gl.getUniformLocation(program, 'u_view_matrix');
    const matProjUniformLocation = gl.getUniformLocation(program, 'u_proj_matrix');
    const matNormUniformLocation = gl.getUniformLocation(program, 'u_normal_matrix');

    gl.uniformMatrix4fv(matViewUniformLocation, false, camera.modelViewMatrix.toArray());
    gl.uniformMatrix4fv(matProjUniformLocation, false, camera.projectionMatrix.toArray());
    gl.uniformMatrix4fv(matWorldUniformLocation, false, this.worldMatrix.toArray());
    gl.uniformMatrix4fv(matNormUniformLocation, false, normalMatrix.toArray());

    this.gl.uniform1i(shadingMode, 1);
    this.gl.uniform1i(shadingStatus, this.isShaded);
    this.gl.uniform1f(ka, 1);
    this.gl.uniform1f(kd, 1);
    this.gl.uniform1f(ks, 1);

    this.gl.uniform1f(shineVal, 100.0);
    this.gl.uniform3fv(ac, new Float32Array([0.1, 0, 0]));
    this.gl.uniform3fv(dc, new Float32Array([0.7, 0.7, 0.7]));
    this.gl.uniform3fv(sc, new Float32Array([0.7, 0.7, 0.7]));
    this.gl.uniform3fv(lightPos, new Float32Array([1, 1, 1]));

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.drawElements(gl.TRIANGLES, this.objIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(this.render.bind(this));
  }
}

export { AppState };
