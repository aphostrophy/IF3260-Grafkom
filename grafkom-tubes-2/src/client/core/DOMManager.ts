import { GlUtils } from '@libs/GlUtils';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

class DOMManager {
  window: Window & typeof globalThis;
  canvas: HTMLCanvasElement;

  constructor() {
    this.window = window;
    this.canvas = canvas;
  }

  getGl() {
    return GlUtils.getWebGL(this.canvas);
  }
}

export { DOMManager };
