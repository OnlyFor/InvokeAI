import { rgbaColorToString } from 'common/util/colorCodeTransformers';
import { deepClone } from 'common/util/deepClone';
import type { CanvasManager } from 'features/controlLayers/konva/CanvasManager';
import type { CanvasObjectRenderer } from 'features/controlLayers/konva/CanvasObjectRenderer';
import type { CanvasEraserLineState, GetLoggingContext } from 'features/controlLayers/store/types';
import { RGBA_RED } from 'features/controlLayers/store/types';
import Konva from 'konva';
import type { Logger } from 'roarr';

export class CanvasEraserLineRenderer {
  static TYPE = 'eraser_line';
  static GROUP_NAME = `${CanvasEraserLineRenderer.TYPE}_group`;
  static LINE_NAME = `${CanvasEraserLineRenderer.TYPE}_line`;

  id: string;
  parent: CanvasObjectRenderer;
  manager: CanvasManager;
  log: Logger;
  getLoggingContext: GetLoggingContext;

  isFirstRender: boolean = false;
  state: CanvasEraserLineState;
  konva: {
    group: Konva.Group;
    line: Konva.Line;
  };

  constructor(state: CanvasEraserLineState, parent: CanvasObjectRenderer) {
    const { id, strokeWidth, clip, points } = state;
    this.id = id;
    this.parent = parent;
    this.manager = parent.manager;
    this.getLoggingContext = this.manager.buildGetLoggingContext(this);
    this.log = this.manager.buildLogger(this.getLoggingContext);

    this.log.trace({ state }, 'Creating eraser line');

    this.konva = {
      group: new Konva.Group({
        name: CanvasEraserLineRenderer.GROUP_NAME,
        clip,
        listening: false,
      }),
      line: new Konva.Line({
        name: CanvasEraserLineRenderer.LINE_NAME,
        listening: false,
        shadowForStrokeEnabled: false,
        strokeWidth,
        tension: 0,
        lineCap: 'round',
        lineJoin: 'round',
        globalCompositeOperation: 'destination-out',
        stroke: rgbaColorToString(RGBA_RED),
        // A line with only one point will not be rendered, so we duplicate the points to make it visible
        points: points.length === 2 ? [...points, ...points] : points,
      }),
    };
    this.konva.group.add(this.konva.line);
    this.state = state;
  }

  update(state: CanvasEraserLineState, force = this.isFirstRender): boolean {
    if (force || this.state !== state) {
      this.isFirstRender = false;

      this.log.trace({ state }, 'Updating eraser line');
      const { points, clip, strokeWidth } = state;
      this.konva.line.setAttrs({
        // A line with only one point will not be rendered, so we duplicate the points to make it visible
        points: points.length === 2 ? [...points, ...points] : points,
        clip,
        strokeWidth,
      });
      this.state = state;
      return true;
    }

    return false;
  }

  destroy() {
    this.log.trace('Destroying eraser line');
    this.konva.group.destroy();
  }

  setVisibility(isVisible: boolean): void {
    this.log.trace({ isVisible }, 'Setting brush line visibility');
    this.konva.group.visible(isVisible);
  }

  repr() {
    return {
      id: this.id,
      type: CanvasEraserLineRenderer.TYPE,
      parent: this.parent.id,
      isFirstRender: this.isFirstRender,
      state: deepClone(this.state),
    };
  }
}
