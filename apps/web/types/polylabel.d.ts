declare module '@mapbox/polylabel' {
  export default function polylabel(
    polygon: number[][][] | number[][],
    precision?: number,
    debug?: boolean
  ): [number, number];
}
