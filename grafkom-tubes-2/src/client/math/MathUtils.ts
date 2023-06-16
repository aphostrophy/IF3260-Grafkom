const MathUtils = {
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
  EPSILON: 0.000001,

  clamp: function (value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  },

  /**
   * Returns a value linearly interpolated from two known points based
   * on the given interval - t = 0 will return x and t = 1 will return y.
   *
   * @param x Start point.
   * @param y End point.
   * @param t interpolation factor in the closed interval [0, 1]
   */
  lerp: function (x: number, y: number, t: number) {
    return (1 - t) * x + t * y;
  },

  degToRad: function (degrees: number) {
    return degrees * MathUtils.DEG2RAD;
  },

  radToDeg: function (radians: number) {
    return radians * MathUtils.RAD2DEG;
  },
};

export { MathUtils };
