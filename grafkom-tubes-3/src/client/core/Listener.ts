import { PerspectiveCamera } from '@cameras/PerspectiveCamera';
import AppState from '@core/AppState';

const injectListeners = (appState: AppState) => {
    const domManager = appState.domManager;

    domManager.window.addEventListener('resize', () => {
        appState.refreshCanvas();
    });

    domManager.canvas.addEventListener('wheel', (ev: WheelEvent) => {
        if (appState.camera instanceof PerspectiveCamera) {
            appState.camera.updateZoom(-ev.deltaY / 1000);
        }
    });

    // TODO : Change to object rotation
    domManager.window.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (ev.key === 'a') {
            appState.camera.rotateY(-0.1);
        }
        if (ev.key === 'd') {
            appState.camera.rotateY(0.1);
        }

        if (ev.key === 'w') {
            appState.camera.rotateX(0.1);
        }
        if (ev.key === 's') {
            appState.camera.rotateX(-0.1);
        }
    });

    domManager.animate.addEventListener('click', () => {
        appState.animateMode = !appState.animateMode;
    });

    domManager.imageMap.addEventListener('click', () => {
        appState.rootModel.changeTextureRender(1);
    });
    domManager.envMap.addEventListener('click', () => {
        appState.rootModel.changeTextureRender(2);
    });
    domManager.bumpMap.addEventListener('click', () => {
        appState.rootModel.changeTextureRender(3);
    });
    domManager.modelPicker.addEventListener('change', (ev) => {
        handleLoadFile(ev, appState);
    });
    domManager.shadingToggler.addEventListener('input', () => {
        appState.rootModel.setShading(domManager.shadingToggler.checked);
    });

    domManager.saveButton.addEventListener('click', () => {
        appState.fileManager.saveAppState(appState);
    });

    domManager.resetButton.addEventListener('click', () => {
        appState.reset();
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

                    appState.loadFile(parse);
                }
            };
            fileReader.readAsText(file);
        }
    }
};

export { injectListeners };
