import type { AppStartListening } from 'app/store/middleware/listenerMiddleware';
import {
  heightChanged,
  setCfgRescaleMultiplier,
  setCfgScale,
  setScheduler,
  setSteps,
  vaePrecisionChanged,
  vaeSelected,
  widthChanged,
} from 'features/controlLayers/store/canvasV2Slice';
import { setDefaultSettings } from 'features/parameters/store/actions';
import {
  isParameterCFGRescaleMultiplier,
  isParameterCFGScale,
  isParameterHeight,
  isParameterPrecision,
  isParameterScheduler,
  isParameterSteps,
  isParameterWidth,
  zParameterVAEModel,
} from 'features/parameters/types/parameterSchemas';
import { toast } from 'features/toast/toast';
import { t } from 'i18next';
import { modelConfigsAdapterSelectors, modelsApi } from 'services/api/endpoints/models';
import { isNonRefinerMainModelConfig } from 'services/api/types';

export const addSetDefaultSettingsListener = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: setDefaultSettings,
    effect: async (action, { dispatch, getState }) => {
      const state = getState();

      const currentModel = state.canvasV2.params.model;

      if (!currentModel) {
        return;
      }

      const request = dispatch(modelsApi.endpoints.getModelConfigs.initiate());
      const data = await request.unwrap();
      request.unsubscribe();
      const models = modelConfigsAdapterSelectors.selectAll(data);

      const modelConfig = models.find((model) => model.key === currentModel.key);

      if (!modelConfig) {
        return;
      }

      if (isNonRefinerMainModelConfig(modelConfig) && modelConfig.default_settings) {
        const { vae, vae_precision, cfg_scale, cfg_rescale_multiplier, steps, scheduler, width, height } =
          modelConfig.default_settings;

        if (vae) {
          // we store this as "default" within default settings
          // to distinguish it from no default set
          if (vae === 'default') {
            dispatch(vaeSelected(null));
          } else {
            const vaeModel = models.find((model) => model.key === vae);
            const result = zParameterVAEModel.safeParse(vaeModel);
            if (!result.success) {
              return;
            }
            dispatch(vaeSelected(result.data));
          }
        }

        if (vae_precision) {
          if (isParameterPrecision(vae_precision)) {
            dispatch(vaePrecisionChanged(vae_precision));
          }
        }

        if (cfg_scale) {
          if (isParameterCFGScale(cfg_scale)) {
            dispatch(setCfgScale(cfg_scale));
          }
        }

        if (cfg_rescale_multiplier) {
          if (isParameterCFGRescaleMultiplier(cfg_rescale_multiplier)) {
            dispatch(setCfgRescaleMultiplier(cfg_rescale_multiplier));
          }
        }

        if (steps) {
          if (isParameterSteps(steps)) {
            dispatch(setSteps(steps));
          }
        }

        if (scheduler) {
          if (isParameterScheduler(scheduler)) {
            dispatch(setScheduler(scheduler));
          }
        }
        const setSizeOptions = { updateAspectRatio: true, clamp: true };
        if (width) {
          if (isParameterWidth(width)) {
            dispatch(widthChanged({ width, ...setSizeOptions }));
          }
        }

        if (height) {
          if (isParameterHeight(height)) {
            dispatch(heightChanged({ height, ...setSizeOptions }));
          }
        }

        toast({ id: 'PARAMETER_SET', title: t('toast.parameterSet', { parameter: 'Default settings' }) });
      }
    },
  });
};
