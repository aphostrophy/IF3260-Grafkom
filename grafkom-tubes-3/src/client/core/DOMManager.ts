import { GlUtils } from '@core/GlUtils';
import Drawable from '@core/Drawable';

const canvasContainer = document.querySelector('div.left') as HTMLDivElement;
const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const menuContainer = document.querySelector('div.right') as HTMLDivElement;
const transformationGrid = document.querySelector('.transformation-grid') as HTMLDivElement;
const imageMap = document.getElementById('texture-model1') as HTMLButtonElement;
const envMap = document.getElementById('texture-model2') as HTMLButtonElement;
const bumpMap = document.getElementById('texture-model3') as HTMLButtonElement;
const modelPicker = document.getElementById('file-picker') as HTMLInputElement;
const shadingToggler = document.querySelector('#shading-toggle') as HTMLInputElement;
const saveButton = document.querySelector('#save') as HTMLButtonElement;
const resetButton = document.querySelector('#reset') as HTMLButtonElement;
const animate = document.getElementById('animate') as HTMLButtonElement;

class DOMManager {
    window: Window & typeof globalThis;
    canvasContainer: HTMLDivElement;
    menuContainer: HTMLDivElement;
    transformationGrid: HTMLDivElement;
    canvas: HTMLCanvasElement;
    imageMap: HTMLButtonElement;
    envMap: HTMLButtonElement;
    bumpMap: HTMLButtonElement;
    modelPicker: HTMLInputElement;
    shadingToggler: HTMLInputElement;
    saveButton: HTMLButtonElement;
    resetButton: HTMLButtonElement;
    animate: HTMLButtonElement;

    throttleTimer: NodeJS.Timer | null;

    constructor() {
        this.window = window;
        this.canvas = canvas;

        this.canvasContainer = canvasContainer;
        this.menuContainer = menuContainer;
        this.transformationGrid = transformationGrid;

        this.throttleTimer = null;
        this.imageMap = imageMap;
        this.envMap = envMap;
        this.bumpMap = bumpMap;
        this.modelPicker = modelPicker;
        this.shadingToggler = shadingToggler;
        this.saveButton = saveButton;
        this.resetButton = resetButton;
        this.animate = animate;
    }

    getGl() {
        return GlUtils.getWebGL(this.canvas);
    }

    generateTransformTree(model: Drawable, dom: HTMLDivElement = transformationGrid) {
        const transformationGridItem = document.createElement('div');
        transformationGridItem.className = 'transformation-grid-item';
        dom.appendChild(transformationGridItem);

        const modelName = document.createElement('div');
        modelName.className = 'model-name';
        modelName.innerText = model.name;
        transformationGridItem.appendChild(modelName);

        const modelTransform = document.createElement('div');
        modelTransform.className = 'model-transform';
        transformationGridItem.appendChild(modelTransform);

        const modelTransformTranslation = document.createElement('div');
        modelTransformTranslation.className = 'model-transform-translation';
        modelTransform.appendChild(modelTransformTranslation);

        if (model.parent == null) {
            const transformType = document.createElement('div');
            transformType.className = 'transform-type';
            transformType.innerText = 'Translation';
            modelTransformTranslation.appendChild(transformType);

            for (let i = 0; i < 3; i++) {
                const sliderContainer = document.createElement('div');
                sliderContainer.className = 'slider-container';
                modelTransformTranslation.appendChild(sliderContainer);

                const span = document.createElement('span');
                if (i === 0) {
                    span.innerText = 'X';
                } else if (i === 1) {
                    span.innerText = 'Y';
                } else {
                    span.innerText = 'Z';
                }

                const translationSlider = document.createElement('input');
                translationSlider.type = 'range';
                translationSlider.min = '-1000';
                translationSlider.max = '1000';
                translationSlider.value = '0';

                if (i === 0) {
                    translationSlider.oninput = () => {
                        const distance = parseFloat(translationSlider.value) / 200;
                        model.setTranslateX(distance);
                    };
                } else if (i === 1) {
                    translationSlider.oninput = () => {
                        const distance = parseFloat(translationSlider.value) / 200;
                        model.setTranslateY(distance);
                    };
                } else {
                    translationSlider.oninput = () => {
                        const distance = parseFloat(translationSlider.value) / 200;
                        model.setTranslateZ(distance);
                    };
                }

                sliderContainer.appendChild(span);
                sliderContainer.appendChild(translationSlider);
            }
        }

        const modelTransformRotation = document.createElement('div');
        modelTransformRotation.className = 'model-transform-rotation';
        modelTransform.appendChild(modelTransformRotation);

        const transformTypeRotation = document.createElement('div');
        transformTypeRotation.className = 'transform-type';
        transformTypeRotation.innerText = 'Rotation';
        modelTransformRotation.appendChild(transformTypeRotation);

        for (let i = 0; i < 3; i++) {
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';
            modelTransformRotation.appendChild(sliderContainer);

            const span = document.createElement('span');
            if (i === 0) {
                span.innerText = 'X';
            } else if (i === 1) {
                span.innerText = 'Y';
            } else {
                span.innerText = 'Z';
            }

            const rotationSlider = document.createElement('input');
            rotationSlider.type = 'range';

            if (i === 0) {
                rotationSlider.min = (-Math.abs(model.joint.ax) * 1000).toString();
                rotationSlider.max = (Math.abs(model.joint.ax) * 1000).toString();
                rotationSlider.value = '0';
                rotationSlider.oninput = () => {
                    const angle =
                        (model.joint.axAbs
                            ? Math.abs(parseFloat(rotationSlider.value))
                            : parseFloat(rotationSlider.value)) / 1000;
                    model.setRotationX(angle);
                };
            } else if (i === 1) {
                rotationSlider.min = (-Math.abs(model.joint.ay) * 1000).toString();
                rotationSlider.max = (Math.abs(model.joint.ay) * 1000).toString();
                rotationSlider.value = '0';
                rotationSlider.oninput = () => {
                    const angle =
                        (model.joint.ayAbs
                            ? Math.abs(parseFloat(rotationSlider.value))
                            : parseFloat(rotationSlider.value)) / 1000;
                    model.setRotationY(angle);
                };
            } else {
                rotationSlider.min = (-Math.abs(model.joint.az) * 1000).toString();
                rotationSlider.max = (Math.abs(model.joint.az) * 1000).toString();
                rotationSlider.value = '0';
                rotationSlider.oninput = () => {
                    const angle =
                        (model.joint.azAbs
                            ? Math.abs(parseFloat(rotationSlider.value))
                            : parseFloat(rotationSlider.value)) / 1000;
                    model.setRotationZ(angle);
                };
            }

            sliderContainer.appendChild(span);
            sliderContainer.appendChild(rotationSlider);
        }

        model.children.forEach((child) => {
            this.generateTransformTree(child, dom);
        });
    }

    generateTransformTreeNew(model: Drawable, dom: HTMLDivElement = transformationGrid) {
        //Create collapsible button
        const collapsibleButton = document.createElement('button');
        collapsibleButton.className = 'collapsible';
        collapsibleButton.innerText = '+ ' + model.name;
        dom.appendChild(collapsibleButton);

        const transformationGridItem = document.createElement('div');
        transformationGridItem.className = 'content';
        dom.appendChild(transformationGridItem);

        const transformationGridItemInner = document.createElement('div');
        transformationGridItemInner.className = 'inner-content';
        transformationGridItem.appendChild(transformationGridItemInner);

        //Add translation controls
        if (model.parent == null) {
            const transformType = document.createElement('div');
            transformType.className = 'transform-type';
            // transformType.innerText = 'Translation';
            transformationGridItemInner.appendChild(transformType);
            // transformationGridItem.style.maxHeight = "";

            for (let i = 0; i < 3; i++) {
                const sliderContainer = document.createElement('div');
                sliderContainer.className = 'slider-container';
                transformationGridItemInner.appendChild(sliderContainer);

                const sliderLabel = document.createElement('span');
                if (i === 0) {
                    sliderLabel.innerText = 'Translation X';
                } else if (i === 1) {
                    sliderLabel.innerText = 'Translation Y';
                } else {
                    sliderLabel.innerText = 'Translation Z';
                }
                sliderLabel.className = 'slider-label';

                const translationSlider = document.createElement('input');
                translationSlider.className = 'form-range';
                translationSlider.type = 'range';
                translationSlider.min = '-1000';
                translationSlider.max = '1000';
                translationSlider.value = '0';

                if (i === 0) {
                    translationSlider.oninput = () => {
                        const distance = parseFloat(translationSlider.value) / 200;
                        model.setTranslateX(distance);
                    };
                } else if (i === 1) {
                    translationSlider.oninput = () => {
                        const distance = parseFloat(translationSlider.value) / 200;
                        model.setTranslateY(distance);
                    };
                } else {
                    translationSlider.oninput = () => {
                        const distance = parseFloat(translationSlider.value) / 200;
                        model.setTranslateZ(distance);
                    };
                }

                sliderContainer.appendChild(sliderLabel);
                sliderContainer.appendChild(translationSlider);
            }
        }

        //Add rotation controls
        const transformType = document.createElement('div');
        transformType.className = 'transform-type';
        // transformType.innerText = 'Rotation';
        transformationGridItemInner.appendChild(transformType);

        for (let i = 0; i < 3; i++) {
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';
            transformationGridItemInner.appendChild(sliderContainer);

            const sliderLabel = document.createElement('span');
            if (i === 0) {
                sliderLabel.innerText = 'Rotation X';
            } else if (i === 1) {
                sliderLabel.innerText = 'Rotation Y';
            } else {
                sliderLabel.innerText = 'Rotation Z';
            }
            sliderLabel.className = 'slider-label';

            const rotationSlider = document.createElement('input');
            rotationSlider.type = 'range';

            if (i === 0) {
                rotationSlider.min = (-Math.abs(model.joint.ax) * 1000).toString();
                rotationSlider.max = (Math.abs(model.joint.ax) * 1000).toString();
                rotationSlider.className = 'form-range';
                rotationSlider.value = '0';
                rotationSlider.oninput = () => {
                    const angle =
                        (model.joint.axAbs
                            ? Math.abs(parseFloat(rotationSlider.value))
                            : parseFloat(rotationSlider.value)) / 1000;
                    model.setRotationX(angle);
                };
            } else if (i === 1) {
                rotationSlider.min = (-Math.abs(model.joint.ay) * 1000).toString();
                rotationSlider.max = (Math.abs(model.joint.ay) * 1000).toString();
                rotationSlider.className = 'form-range';
                rotationSlider.value = '0';
                rotationSlider.oninput = () => {
                    const angle =
                        (model.joint.ayAbs
                            ? Math.abs(parseFloat(rotationSlider.value))
                            : parseFloat(rotationSlider.value)) / 1000;
                    model.setRotationY(angle);
                };
            } else {
                rotationSlider.min = (-Math.abs(model.joint.az) * 1000).toString();
                rotationSlider.max = (Math.abs(model.joint.az) * 1000).toString();
                rotationSlider.className = 'form-range';
                rotationSlider.value = '0';
                rotationSlider.oninput = () => {
                    const angle =
                        (model.joint.azAbs
                            ? Math.abs(parseFloat(rotationSlider.value))
                            : parseFloat(rotationSlider.value)) / 1000;
                    model.setRotationZ(angle);
                };
            }

            sliderContainer.appendChild(sliderLabel);
            sliderContainer.appendChild(rotationSlider);

            //Set collapsible button
            collapsibleButton.addEventListener('click', function () {
                this.classList.toggle('active');
                if (transformationGridItem != null) {
                    if (
                        transformationGridItem.style.maxHeight ==
                        transformationGridItem.scrollHeight + 'px'
                    ) {
                        transformationGridItem.style.maxHeight = '0px';
                    } else {
                        transformationGridItem.style.maxHeight =
                            transformationGridItem.scrollHeight + 'px';
                    }
                }
            });
        }

        model.children.forEach((child) => {
            this.generateTransformTreeNew(child, dom);
        });
    }
}

export { DOMManager };
