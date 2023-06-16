import { DOMManager } from '@core/DOMManager';
import { FileManager } from '@core/FileManager';
import { GlUtils } from '@core/GlUtils';
import FragmentShaderSource from '@shaders/FragmentShader.glsl';
import VertexShaderSource from '@shaders/VertexShader.glsl';
import { PerspectiveCamera } from '@cameras/PerspectiveCamera';
import Ayam from '@geometries/Ayam.json';
import { Camera } from '@cameras/Camera';
import { injectListeners } from './Listener';
import Drawable from './Drawable';
import { Matrix4 } from '@math/Matrix4';

class AppState {
    domManager: DOMManager;
    fileManager: FileManager;

    gl: WebGLRenderingContext;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    program: WebGLProgram;

    camera: Camera;

    rootModel: Drawable;
    logicalClock: number;
    animateMode: boolean;

    constructor() {
        this.domManager = new DOMManager();
        this.fileManager = new FileManager();
        this.gl = this.domManager.getGl();

        this.vertexShader = GlUtils.getShader(this.gl, this.gl.VERTEX_SHADER, VertexShaderSource);
        this.fragmentShader = GlUtils.getShader(
            this.gl,
            this.gl.FRAGMENT_SHADER,
            FragmentShaderSource
        );
        this.program = GlUtils.createProgram(this.gl, this.vertexShader, this.fragmentShader);
        this.camera = new PerspectiveCamera(
            75,
            (window.innerWidth * 0.7) / window.innerHeight,
            0.1,
            100
        );
        this.logicalClock = 0;
        this.animateMode = false;

        const { gl, program, camera } = this;

        this.rootModel = new Drawable(gl, program, Ayam, camera);

        this.onModelChange();

        this.setupCanvas();
        injectListeners(this);
    }

    setupCanvas() {
        const gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        this.refreshCanvas();
    }

    refreshCanvas() {
        const gl = this.gl;
        (this.domManager.canvas as HTMLCanvasElement).width =
            this.domManager.canvasContainer.clientWidth;
        (this.domManager.canvas as HTMLCanvasElement).height =
            this.domManager.canvasContainer.clientHeight;
        gl.clearColor(0.9, 0.9, 0.9, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    loadFile(model: DrawableTreeHierarchy) {
        this.rootModel = new Drawable(this.gl, this.program, model, this.camera);
        model.children.forEach((child) => {
            this.insertNodeAsChild(this.rootModel, child);
        });
        this.onModelChange();
    }

    insertNodeAsChild(parentNode: Drawable, node: DrawableTreeHierarchy) {
        const model = new Drawable(this.gl, this.program, node, this.camera);
        parentNode.attach(model);
        node.children.forEach((child) => {
            this.insertNodeAsChild(model, child);
        });
    }

    /* Executed once at the start of the lifecycle */
    run() {
        const camera = this.camera;
        camera.position.set(0, 0, 8);
        camera.lookAt(0, 0, 0);

        requestAnimationFrame(this.update.bind(this));
    }

    // TODO: Limit jadi 60 FPS
    /* Executed every cpu cycle */
    update() {
        const { gl } = this;
        gl.clearColor(0.9, 0.9, 0.9, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        this.camera.lookAt(0, 0, 0);
        this.camera.updateMatrix();

        if (this.animateMode) {
            this.rootModel.animate(this.logicalClock);
            this.rootModel.draw(new Matrix4());
            this.logicalClock++;
        } else {
            this.rootModel.draw(new Matrix4());
        }
        requestAnimationFrame(this.update.bind(this));
    }

    onModelChange() {
        while (this.domManager.transformationGrid.hasChildNodes()) {
            this.domManager.transformationGrid.removeChild(
                this.domManager.transformationGrid.firstChild!
            );
        }
        this.domManager.generateTransformTreeNew(this.rootModel);
        if (this.rootModel.textureMode == 'image') {
            this.rootModel.changeTextureRender(1);
        }
        if (this.rootModel.textureMode == 'environment') {
            this.rootModel.changeTextureRender(2);
        }
        if (this.rootModel.textureMode == 'bump') {
            this.rootModel.changeTextureRender(3);
        }
    }

    reset() {
        this.rootModel.reset();
        this.camera.cameraReset();
    }
}

export default AppState;
