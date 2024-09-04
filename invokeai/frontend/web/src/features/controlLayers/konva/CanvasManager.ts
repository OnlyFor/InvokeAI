import type { AppSocket } from 'app/hooks/useSocketIO';
import { logger } from 'app/logging/logger';
import type { AppStore } from 'app/store/store';
import type { SerializableObject } from 'common/types';
import { SyncableMap } from 'common/util/SyncableMap/SyncableMap';
import { CanvasBboxModule } from 'features/controlLayers/konva/CanvasBboxModule';
import { CanvasCacheModule } from 'features/controlLayers/konva/CanvasCacheModule';
import { CanvasCompositorModule } from 'features/controlLayers/konva/CanvasCompositorModule';
import type { CanvasControlLayerAdapter } from 'features/controlLayers/konva/CanvasControlLayerAdapter';
import { CanvasEntityRendererModule } from 'features/controlLayers/konva/CanvasEntityRendererModule';
import { CanvasFilterModule } from 'features/controlLayers/konva/CanvasFilterModule';
import type { CanvasInpaintMaskAdapter } from 'features/controlLayers/konva/CanvasInpaintMaskAdapter';
import { CanvasModuleBase } from 'features/controlLayers/konva/CanvasModuleBase';
import { CanvasProgressImageModule } from 'features/controlLayers/konva/CanvasProgressImageModule';
import type { CanvasRasterLayerAdapter } from 'features/controlLayers/konva/CanvasRasterLayerAdapter';
import type { CanvasRegionalGuidanceAdapter } from 'features/controlLayers/konva/CanvasRegionalGuidanceAdapter';
import { CanvasStageModule } from 'features/controlLayers/konva/CanvasStageModule';
import { CanvasStagingAreaModule } from 'features/controlLayers/konva/CanvasStagingAreaModule';
import { CanvasToolModule } from 'features/controlLayers/konva/CanvasToolModule';
import { CanvasWorkerModule } from 'features/controlLayers/konva/CanvasWorkerModule.js';
import { getPrefixedId } from 'features/controlLayers/konva/util';
import Konva from 'konva';
import type { Atom } from 'nanostores';
import { atom, computed } from 'nanostores';
import type { Logger } from 'roarr';

import { CanvasBackgroundModule } from './CanvasBackgroundModule';
import { CanvasStateApiModule } from './CanvasStateApiModule';

export const $canvasManager = atom<CanvasManager | null>(null);

export class CanvasManager extends CanvasModuleBase {
  readonly type = 'manager';
  readonly id: string;
  readonly path: string[];
  readonly manager: CanvasManager;
  readonly parent: CanvasManager;
  readonly log: Logger;

  store: AppStore;
  socket: AppSocket;

  adapters = {
    rasterLayers: new SyncableMap<string, CanvasRasterLayerAdapter>(),
    controlLayers: new SyncableMap<string, CanvasControlLayerAdapter>(),
    regionMasks: new SyncableMap<string, CanvasRegionalGuidanceAdapter>(),
    inpaintMasks: new SyncableMap<string, CanvasInpaintMaskAdapter>(),
    getAll: (): (
      | CanvasRasterLayerAdapter
      | CanvasControlLayerAdapter
      | CanvasRegionalGuidanceAdapter
      | CanvasInpaintMaskAdapter
    )[] => {
      return [
        ...this.adapters.rasterLayers.values(),
        ...this.adapters.controlLayers.values(),
        ...this.adapters.regionMasks.values(),
        ...this.adapters.inpaintMasks.values(),
      ];
    },
  };

  stateApi: CanvasStateApiModule;
  background: CanvasBackgroundModule;
  filter: CanvasFilterModule;
  stage: CanvasStageModule;
  worker: CanvasWorkerModule;
  cache: CanvasCacheModule;
  entityRenderer: CanvasEntityRendererModule;
  compositor: CanvasCompositorModule;
  tool: CanvasToolModule;
  bbox: CanvasBboxModule;
  stagingArea: CanvasStagingAreaModule;
  progressImage: CanvasProgressImageModule;

  konva: {
    previewLayer: Konva.Layer;
  };

  _isDebugging: boolean = false;

  /**
   * Whether the canvas is currently busy with a transformation or filtering operation.
   */
  $isBusy: Atom<boolean>;

  constructor(stage: Konva.Stage, container: HTMLDivElement, store: AppStore, socket: AppSocket) {
    super();
    this.id = getPrefixedId(this.type);
    this.path = [this.id];
    this.manager = this;
    this.parent = this;
    this.log = logger('canvas').child((message) => {
      return {
        ...message,
        context: {
          ...this.getLoggingContext(),
          ...message.context,
        },
      };
    });
    this.log.debug('Creating canvas manager module');

    this.store = store;
    this.socket = socket;

    this.stateApi = new CanvasStateApiModule(this.store, this);
    this.stage = new CanvasStageModule(stage, container, this);
    this.worker = new CanvasWorkerModule(this);
    this.cache = new CanvasCacheModule(this);
    this.entityRenderer = new CanvasEntityRendererModule(this);
    this.filter = new CanvasFilterModule(this);

    this.compositor = new CanvasCompositorModule(this);

    this.background = new CanvasBackgroundModule(this);
    this.stage.addLayer(this.background.konva.layer);

    this.konva = {
      previewLayer: new Konva.Layer({ listening: false, imageSmoothingEnabled: false }),
    };
    this.stage.addLayer(this.konva.previewLayer);

    this.tool = new CanvasToolModule(this);
    this.stagingArea = new CanvasStagingAreaModule(this);
    this.progressImage = new CanvasProgressImageModule(this);
    this.bbox = new CanvasBboxModule(this);

    // Must add in this order for correct z-index
    this.konva.previewLayer.add(this.stagingArea.konva.group);
    this.konva.previewLayer.add(this.progressImage.konva.group);
    this.konva.previewLayer.add(this.bbox.konva.group);
    this.konva.previewLayer.add(this.tool.konva.group);

    this.$isBusy = computed([this.filter.$isFiltering, this.stateApi.$isTranforming], (isFiltering, isTransforming) => {
      return isFiltering || isTransforming;
    });
  }

  enableDebugging() {
    this._isDebugging = true;
    this.logDebugInfo();
  }

  disableDebugging() {
    this._isDebugging = false;
  }

  initialize = () => {
    this.log.debug('Initializing canvas manager module');

    // These atoms require the canvas manager to be set up before we can provide their initial values
    this.stateApi.$transformingAdapter.set(null);
    this.stateApi.$settingsState.set(this.stateApi.getSettings());
    this.stateApi.$selectedEntityIdentifier.set(this.stateApi.getCanvasState().selectedEntityIdentifier);
    this.stateApi.$currentFill.set(this.stateApi.getCurrentColor());
    this.stateApi.$selectedEntity.set(this.stateApi.getSelectedEntity());

    this.stage.initialize();
    $canvasManager.set(this);
  };

  destroy = () => {
    this.log.debug('Destroying module');

    for (const adapter of this.adapters.getAll()) {
      adapter.destroy();
    }

    this.bbox.destroy();
    this.stagingArea.destroy();
    this.tool.destroy();
    this.progressImage.destroy();
    this.konva.previewLayer.destroy();

    this.stateApi.destroy();
    this.background.destroy();
    this.filter.destroy();
    this.worker.destroy();
    this.entityRenderer.destroy();
    this.compositor.destroy();
    this.stage.destroy();

    $canvasManager.set(null);
  };

  repr = () => {
    return {
      id: this.id,
      type: this.type,
      path: this.path,
      rasterLayers: Array.from(this.adapters.rasterLayers.values()).map((adapter) => adapter.repr()),
      controlLayers: Array.from(this.adapters.controlLayers.values()).map((adapter) => adapter.repr()),
      inpaintMasks: Array.from(this.adapters.inpaintMasks.values()).map((adapter) => adapter.repr()),
      regionMasks: Array.from(this.adapters.regionMasks.values()).map((adapter) => adapter.repr()),
      stateApi: this.stateApi.repr(),
      bbox: this.bbox.repr(),
      stagingArea: this.stagingArea.repr(),
      tool: this.tool.repr(),
      progressImage: this.progressImage.repr(),
      background: this.background.repr(),
      filter: this.filter.repr(),
      worker: this.worker.repr(),
      entityRenderer: this.entityRenderer.repr(),
      compositor: this.compositor.repr(),
      stage: this.stage.repr(),
    };
  };

  getLoggingContext = (): SerializableObject => ({ path: this.path });

  buildPath = (canvasModule: CanvasModuleBase): string[] => {
    return canvasModule.parent.path.concat(canvasModule.id);
  };

  buildLogger = (canvasModule: CanvasModuleBase): Logger => {
    return this.log.child((message) => {
      return {
        ...message,
        context: {
          ...message.context,
          ...canvasModule.getLoggingContext(),
        },
      };
    });
  };

  logDebugInfo() {
    // eslint-disable-next-line no-console
    console.log('Canvas manager', this);
    this.log.debug({ manager: this.repr() }, 'Canvas manager');
  }
}
