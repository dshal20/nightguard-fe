declare module "jscanify/client" {
  interface HighlightOptions {
    color?: string;
    thickness?: number;
  }

  interface CornerPoints {
    topLeftCorner?: { x: number; y: number };
    topRightCorner?: { x: number; y: number };
    bottomLeftCorner?: { x: number; y: number };
    bottomRightCorner?: { x: number; y: number };
  }

  export default class Jscanify {
    findPaperContour(img: unknown): unknown;
    getCornerPoints(contour: unknown): CornerPoints;
    highlightPaper(image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement, options?: HighlightOptions): HTMLCanvasElement;
    extractPaper(image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement, resultWidth: number, resultHeight: number, cornerPoints?: CornerPoints): HTMLCanvasElement | null;
  }
}
