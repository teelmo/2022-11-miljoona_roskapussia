// eslint-disable-next-line
const easingFn = (t, b, c, d) => c * ((t = t / d - 1) * t * t + 1) + b;

export default easingFn;
