export type Amp = [number, number];

export const add = (a: Amp, b: Amp): Amp => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Amp, b: Amp): Amp => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: Amp, b: Amp): Amp => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
];
export const conj = (a: Amp): Amp => [a[0], -a[1]];
export const abs2 = (a: Amp): number => a[0] * a[0] + a[1] * a[1];
export const scale = (a: Amp, s: number): Amp => [a[0] * s, a[1] * s];
