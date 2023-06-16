import { Camera } from '@cameras/Camera';
import { Object3D } from '@core/Object3D';
import { Matrix4 } from '@math/Matrix4';
import { Quaternion } from '@math/Quaternion';
import { Vector3 } from '@math/Vector3';
import TextureMarble from '@assets/marbleTextureImage.png';
import BumpTexture from '@assets/Bumped.png';

import Right from '@assets/right.png';
import Left from '@assets/left.png';
import Up from '@assets/up.png';
import Down from '@assets/down.png';
import Front from '@assets/front.png';
import Back from '@assets/back.png';

import { Vector4 } from '@math/Vector4';

let counter = 0;

const _position = /*@__PURE__*/ new Vector3();
const _rotation = /*@__PURE__*/ new Quaternion();
const _scale = /*@__PURE__*/ new Vector3();

class Drawable extends Object3D {
    gl: WebGLRenderingContext;
    program: WebGLProgram;

    parent: Drawable | null = null;
    children: Drawable[] = [];

    vertices: number[] = [];
    indices: number[] = [];
    rawColors: number[] = []; //untuk keperluan save, karena malas
    colors: number[] = [];
    uv: number[] = [];
    animation: DrawableAnimation;
    joint: JointAngle;
    isShaded: number;

    rotationTransform: Vector3;
    translationTransform: Vector3;

    textureMode: TextureMode;

    camera: Camera;
    originalModel: DrawableTreeHierarchy;

    constructor(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
        model: DrawableTreeHierarchy,
        camera: Camera
    ) {
        super();
        this.originalModel = model;
        this.type = 'drawable';
        this.gl = gl;
        this.program = program;

        this.isShaded = 1;

        this.textureMode = 'image';

        this.name = model.name;
        this.vertices = model.render.vertices;
        this.indices = model.render.indices;
        for (let j = 0; j < model.render.colors.length; j += 4) {
            for (let i = 0; i < 4; i++) {
                this.colors.push(model.render.colors[j]);
                this.colors.push(model.render.colors[j + 1]);
                this.colors.push(model.render.colors[j + 2]);
                this.colors.push(model.render.colors[j + 3]);
            }
        }
        this.uv = model.render.uv;
        this.rawColors = model.render.colors;

        this.animation = model.animation;
        this.joint = model.joint;
        this.rotationTransform = new Vector3(0, 0, 0);
        this.translationTransform = new Vector3(0, 0, 0);
        const baseTransformMatrix = new Matrix4().fromArray(model.transform);

        baseTransformMatrix.decompose(this.position, this.quaternion, this.scale);

        this.camera = camera;
    }

    bindImageTexture() {
        const texture = this.gl.createTexture();

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            1,
            1,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255])
        );

        const image = new Image();
        image.src = TextureMarble;
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                image
            );
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        };
    }

    bindEnvironmentTexture() {
        var texture = this.gl.createTexture();

        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);

        const faceInfos = [
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: Right,
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: Left,
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: Up,
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: Down,
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: Front,
            },
            {
                target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: Back,
            },
        ];

        faceInfos.forEach((faceInfo) => {
            const { target, url } = faceInfo;

            this.gl.texImage2D(
                target,
                0,
                this.gl.RGBA,
                512,
                512,
                0,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                null
            );

            const image = new Image();
            image.onload = () => {
                // Now that the image has loaded make copy it to the texture.
                this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);
                this.gl.texImage2D(
                    target,
                    0,
                    this.gl.RGBA,
                    this.gl.RGBA,
                    this.gl.UNSIGNED_BYTE,
                    image
                );
                this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
            };

            image.src = url;
        });
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        this.gl.texParameteri(
            this.gl.TEXTURE_CUBE_MAP,
            this.gl.TEXTURE_MIN_FILTER,
            this.gl.LINEAR_MIPMAP_LINEAR
        );
    }

    bindBumpTexture() {
        const texture = this.gl.createTexture();

        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            1,
            1,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255])
        );

        const image = new Image();
        image.src = BumpTexture;
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                image
            );
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        };
    }

    private assignParent(object: Drawable) {
        if (this.parent !== null) {
            console.error("Can't assign parent when this already have a parent");
            return;
        }

        this.parent = object;
    }

    setShading(isShaded: boolean) {
        this.isShaded = isShaded ? 1 : 0;
        this.children.forEach((child) => child.setShading(isShaded));
    }

    changeTextureRender(id: Number) {
        if (id == 1) {
            this.changeTextureMode('image');
            this.bindImageTexture();
        } else if (id == 2) {
            this.changeTextureMode('environment');
            this.bindEnvironmentTexture();
        } else if (id == 3) {
            this.changeTextureMode('bump');
            this.bindBumpTexture();
        }
        this.children.forEach((child) => {
            child.changeTextureRender(id);
        });
    }

    changeTextureMode(textureMode: TextureMode) {
        this.textureMode = textureMode;
    }
    // adds object as a child of this
    attach(object: Drawable) {
        this.children.push(object);
        object.assignParent(this);
    }

    translateOnAxis(axis: Vector3, distance: number): this {
        super.translateOnAxis(axis, distance);

        return this;
    }

    rotateOnAxis(axis: Vector3, angle: number): this {
        super.rotateOnAxis(axis, angle);

        return this;
    }

    setRotationFromMatrixInvoker(): void {
        const qRotationMatrix = new Matrix4();
        const xRotationMatrix = new Matrix4();
        const yRotationMatrix = new Matrix4();
        const zRotationMatrix = new Matrix4();

        qRotationMatrix.makeRotationFromQuaternion(this.quaternionBuffer);
        xRotationMatrix.makeRotationX(this.rotationTransform.x);
        yRotationMatrix.makeRotationY(this.rotationTransform.y);
        zRotationMatrix.makeRotationZ(this.rotationTransform.z);

        super.setRotationFromMatrix(
            qRotationMatrix
                .multiply(xRotationMatrix)
                .multiply(yRotationMatrix)
                .multiply(zRotationMatrix)
        );
    }

    setRotationX(angle: number): void {
        this.rotationTransform.setX(angle);
        this.setRotationFromMatrixInvoker();
    }

    setRotationY(angle: number): void {
        this.rotationTransform.setY(angle);
        this.setRotationFromMatrixInvoker();
    }

    setRotationZ(angle: number): void {
        this.rotationTransform.setZ(angle);
        this.setRotationFromMatrixInvoker();
    }

    translateInvoker() {
        this.position.set(
            this.translationTransform.x,
            this.translationTransform.y,
            this.translationTransform.z
        );
        this.position.applyQuaternion(this.quaternion);
    }

    setTranslateX(distance: number): void {
        this.translationTransform.setX(distance);
        this.translateInvoker();
    }

    setTranslateY(distance: number): void {
        this.translationTransform.setY(distance);
        this.translateInvoker();
    }

    setTranslateZ(distance: number): void {
        this.translationTransform.setZ(distance);
        this.translateInvoker();
    }

    draw(baseTransformMatrix: Matrix4) {
        const { gl, camera, program } = this;

        const positionAttribLocation = gl.getAttribLocation(program, 'a_position');
        const colorAttribLocation = gl.getAttribLocation(program, 'a_color');
        const normalAttribLocation = gl.getAttribLocation(program, 'normal');
        const uvAttribLocation = gl.getAttribLocation(program, 'a_uv');

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        const normalBuffer = gl.createBuffer();
        const normalVertices = new Float32Array(this.indices);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalVertices), gl.STATIC_DRAW);

        const textureBuffer = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uv), this.gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttribLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorAttribLocation);

        gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalAttribLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.vertexAttribPointer(uvAttribLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(uvAttribLocation);

        // Tell OpenGL state machine which program should be active.
        gl.useProgram(program);

        /* SHADINGS */
        const shadingMode = gl.getUniformLocation(program, 'mode');
        const shadingStatus = gl.getUniformLocation(program, 'shading');
        const ka = gl.getUniformLocation(program, 'Ka');
        const kd = gl.getUniformLocation(program, 'Kd');
        const ks = gl.getUniformLocation(program, 'Ks');
        const shineVal = gl.getUniformLocation(program, 'shininessVal');
        const ac = gl.getUniformLocation(program, 'ambientColor');
        const dc = gl.getUniformLocation(program, 'diffuseColor');
        const sc = gl.getUniformLocation(program, 'specularColor');
        const lightPos = gl.getUniformLocation(program, 'lightPos');

        /* TEXTURES */
        const textureMode = gl.getUniformLocation(program, 'texture_mode');
        const textureSampler = gl.getUniformLocation(program, 'u_sampler');
        const textureSamplerCube = gl.getUniformLocation(program, 'u_texture');

        this.updateMatrix();

        const derivedTransformMatrix = this.matrixWorld
            .clone()
            .transitiveTransform(baseTransformMatrix);

        const normalMatrix = camera.modelViewMatrix.clone().invert().transpose();

        const matWorldUniformLocation = gl.getUniformLocation(program, 'u_model_matrix');
        const matViewUniformLocation = gl.getUniformLocation(program, 'u_view_matrix');
        const matProjUniformLocation = gl.getUniformLocation(program, 'u_proj_matrix');
        const matNormUniformLocation = gl.getUniformLocation(program, 'u_normal_matrix');

        gl.uniformMatrix4fv(matViewUniformLocation, false, camera.modelViewMatrix.toArray());
        gl.uniformMatrix4fv(matProjUniformLocation, false, camera.projectionMatrix.toArray());
        gl.uniformMatrix4fv(matWorldUniformLocation, false, derivedTransformMatrix.toArray());
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

        if (this.textureMode == 'image') {
            this.gl.uniform1i(textureMode, 1);
            this.gl.uniform1i(textureSampler, 0);
            this.gl.uniform1i(textureSamplerCube, 1);
        } else if (this.textureMode == 'environment') {
            this.gl.uniform1i(textureMode, 2);
            this.gl.uniform1i(textureSampler, 1);
            this.gl.uniform1i(textureSamplerCube, 0);
        } else if (this.textureMode == 'bump') {
            this.gl.uniform1i(textureMode, 3);
            this.gl.uniform1i(textureSampler, 0);
            this.gl.uniform1i(textureSamplerCube, 1);
        }

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        this.children.forEach((children) => children.draw(derivedTransformMatrix));
    }

    animate(logicalClock: number) {
        const { ax, fx, ay, fy, az, fz } = this.animation;
        const xRotationMatrix = new Matrix4();
        const yRotationMatrix = new Matrix4();
        const zRotationMatrix = new Matrix4();
        const qRotationMatrix = new Matrix4();

        xRotationMatrix.makeRotationX(
            this.animation.axAbs
                ? Math.abs((ax * Math.sin(fx * logicalClock)) / 2)
                : (ax * Math.sin(fx * logicalClock)) / 2
        );
        yRotationMatrix.makeRotationY(
            this.animation.ayAbs
                ? Math.abs((ay * Math.sin(fy * logicalClock)) / 2)
                : (ay * Math.sin(fy * logicalClock)) / 2
        );
        zRotationMatrix.makeRotationZ(
            this.animation.azAbs
                ? Math.abs((az * Math.sin(fz * logicalClock)) / 2)
                : (az * Math.sin(fz * logicalClock)) / 2
        );
        qRotationMatrix.makeRotationFromQuaternion(this.quaternionBuffer);

        const rotationMatrix = qRotationMatrix
            .multiply(xRotationMatrix)
            .multiply(yRotationMatrix)
            .multiply(zRotationMatrix);

        this.setRotationFromMatrix(rotationMatrix);

        this.children.forEach((child) => child.animate(logicalClock));
    }

    save() {}

    reset() {

        this.isShaded = 1;

        this.textureMode = 'image';

        this.name = this.originalModel.name;
        this.vertices = this.originalModel.render.vertices;
        this.indices = this.originalModel.render.indices;
        for (let j = 0; j < this.originalModel.render.colors.length; j += 4) {
            for (let i = 0; i < 4; i++) {
                this.colors.push(this.originalModel.render.colors[j]);
                this.colors.push(this.originalModel.render.colors[j + 1]);
                this.colors.push(this.originalModel.render.colors[j + 2]);
                this.colors.push(this.originalModel.render.colors[j + 3]);
            }
        }
        this.uv = this.originalModel.render.uv;

        this.animation = this.originalModel.animation;
        this.joint = this.originalModel.joint;
        this.rotationTransform = new Vector3(0, 0, 0);
        this.translationTransform = new Vector3(0, 0, 0);
        const baseTransformMatrix = new Matrix4().fromArray(this.originalModel.transform);

        baseTransformMatrix.decompose(this.position, this.quaternion, this.scale);
        this.children.forEach((child) => child.reset());

    }
}

export default Drawable;
