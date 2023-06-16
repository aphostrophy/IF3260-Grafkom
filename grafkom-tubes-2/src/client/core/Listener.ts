import { _position, _target } from './Object3D';
import { AppState } from './AppState';
import { PerspectiveCamera } from '@cameras/PerspectiveCamera';
import { OrthographicCamera } from '@cameras/OrthographicCamera';
import { Vector3 } from '@math/Vector3';

const setupListeners = (appState: AppState) => {
  const domManager = appState.domManager;

  domManager.canvas.addEventListener('wheel', (ev: WheelEvent) => {
    if (ev.deltaY > 0) {
      if (
        appState.camera instanceof PerspectiveCamera ||
        appState.camera instanceof OrthographicCamera
      ) {
        appState.camera.position.z += -0.2;
      }
    }

    if (ev.deltaY < 0) {
      if (
        appState.camera instanceof PerspectiveCamera ||
        appState.camera instanceof OrthographicCamera
      ) {
        appState.camera.position.z += 0.2;
      }
    }

    if (
      appState.camera instanceof OrthographicCamera ||
      appState.camera instanceof PerspectiveCamera
    ) {
      appState.camera.updateProjectionMatrix();
    }
  });

  domManager.window.addEventListener('keydown', (ev: KeyboardEvent) => {
    if (ev.key === 'a') {
      appState.camera.rotateY(-0.1);
    }
    if (ev.key === 'd') {
      appState.camera.rotateY(0.1);
    }

    if (ev.key === 'w') {
      if (_position.y < _position.distanceTo(_target) - 0.5) {
        appState.camera.rotateX(0.1);
      }
    }
    if (ev.key === 's') {
      if (-_position.y < _position.distanceTo(_target) - 0.5) {
        appState.camera.rotateX(-0.1);
      }
    }

    if (ev.key === 'j') {
      appState.position.x += 0.1;
    }
    if (ev.key === 'l') {
      appState.position.x += -0.1;
    }

    if (ev.key === 'i') {
      appState.position.y += 0.1;
    }

    if (ev.key === 'k') {
      appState.position.y += -0.1;
    }

    if (ev.key === 'o') {
      appState.position.z += 0.1;
    }

    if (ev.key === 'p') {
      appState.position.z += -0.1;
    }

    if (ev.key === 't') {
      appState.thetaX += 0.1;
    }

    if (ev.key === 'g') {
      appState.thetaX -= 0.1;
    }

    if (ev.key === 'h') {
      appState.thetaY += 0.1;
    }

    if (ev.key === 'f') {
      appState.thetaY -= 0.1;
    }

    if (ev.key === 'm') {
      appState.isShaded = appState.isShaded == 0 ? 1 : 0;
    }

    if (ev.key === 'r') {
      appState.resetState();
    }

    if (ev.key === '1') {
      appState.projection = 1;
    }

    if (ev.key === '2') {
      appState.projection = 2;
    }

    if (ev.key === '3') {
      appState.projection = 3;
    }

    if (ev.key === ',') {
      appState.scale.multiplyScalar(0.95);
    }
    if (ev.key === '.') {
      appState.scale.multiplyScalar(1.05);
    }

    if (ev.key === '6') {
      window.location.href = 'http://localhost:9000?box';
    }
    if (ev.key === '7') {
      window.location.href = 'http://localhost:9000?torus';
    }
    if (ev.key === '8') {
      window.location.href = 'http://localhost:9000?knot';
    }
    if (ev.key === '9') {
      window.location.href = 'http://localhost:9000?prism';
    }

    if (
      appState.camera instanceof OrthographicCamera ||
      appState.camera instanceof PerspectiveCamera
    ) {
      appState.camera.updateProjectionMatrix();
    }
  });
};

const handleLoadFile = (ev: Event, appState: AppState) => {
  {
    const target = ev.target;
    if (target instanceof HTMLInputElement && target.files) {
      const file = target.files[0];
      if (!file) {
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = (ev: ProgressEvent<FileReader>) => {
        if (ev.target instanceof FileReader) {
          const content = ev.target.result as string;
          const parse = JSON.parse(content);

          appState.objVertices = parse.vertices;
          appState.objIndices = parse.indices;
          appState.objColors = parse.colors;

          // appState.setupCanvas();
          appState.run();
        }
      };
      fileReader.readAsText(file);
    }
  }
};

export { setupListeners };
