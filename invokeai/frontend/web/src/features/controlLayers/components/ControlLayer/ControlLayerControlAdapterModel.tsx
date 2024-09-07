import { Combobox, FormControl, Tooltip } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { useGroupedModelCombobox } from 'common/hooks/useGroupedModelCombobox';
import { useCanvasManager } from 'features/controlLayers/contexts/CanvasManagerProviderGate';
import { useEntityIdentifierContext } from 'features/controlLayers/contexts/EntityIdentifierContext';
import { selectBase } from 'features/controlLayers/store/paramsSlice';
import { IMAGE_FILTERS, isFilterableEntityIdentifier, isFilterType } from 'features/controlLayers/store/types';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useControlNetAndT2IAdapterModels } from 'services/api/hooks/modelsByType';
import type { AnyModelConfig, ControlNetModelConfig, T2IAdapterModelConfig } from 'services/api/types';

type Props = {
  modelKey: string | null;
  onChange: (modelConfig: ControlNetModelConfig | T2IAdapterModelConfig) => void;
};

export const ControlLayerControlAdapterModel = memo(({ modelKey, onChange: onChangeModel }: Props) => {
  const { t } = useTranslation();
  const entityIdentifier = useEntityIdentifierContext();
  const canvasManager = useCanvasManager();
  const currentBaseModel = useAppSelector(selectBase);
  const [modelConfigs, { isLoading }] = useControlNetAndT2IAdapterModels();
  const selectedModel = useMemo(() => modelConfigs.find((m) => m.key === modelKey), [modelConfigs, modelKey]);

  const _onChange = useCallback(
    (modelConfig: ControlNetModelConfig | T2IAdapterModelConfig | null) => {
      if (!modelConfig) {
        return;
      }
      onChangeModel(modelConfig);

      // When we set the model for the first time, we'll set the default filter settings and open the filter popup

      if (modelKey) {
        // If there is already a model key, this is not the first time we're setting the model
        return;
      }

      // Open the filter popup by setting this entity as the filtering entity
      if (!canvasManager.stateApi.$isFiltering.get()) {
        if (!isFilterableEntityIdentifier(entityIdentifier)) {
          return;
        }
        const adapter = canvasManager.getAdapter(entityIdentifier);
        if (!adapter) {
          return;
        }

        // Update the filter, preferring the model's default
        const filterConfig = isFilterType(modelConfig.default_settings?.preprocessor)
          ? IMAGE_FILTERS[modelConfig.default_settings.preprocessor].buildDefaults(modelConfig.base)
          : IMAGE_FILTERS.canny_image_processor.buildDefaults(modelConfig.base);

        adapter.filterer.startFilter(filterConfig);
        adapter.filterer.previewFilter();
      }
    },
    [canvasManager, entityIdentifier, modelKey, onChangeModel]
  );

  const getIsDisabled = useCallback(
    (model: AnyModelConfig): boolean => {
      const isCompatible = currentBaseModel === model.base;
      const hasMainModel = Boolean(currentBaseModel);
      return !hasMainModel || !isCompatible;
    },
    [currentBaseModel]
  );

  const { options, value, onChange, noOptionsMessage } = useGroupedModelCombobox({
    modelConfigs,
    onChange: _onChange,
    selectedModel,
    getIsDisabled,
    isLoading,
    groupByType: true,
  });

  return (
    <Tooltip label={selectedModel?.description}>
      <FormControl isInvalid={!value || currentBaseModel !== selectedModel?.base} w="full">
        <Combobox
          options={options}
          placeholder={t('controlnet.selectModel')}
          value={value}
          onChange={onChange}
          noOptionsMessage={noOptionsMessage}
        />
      </FormControl>
    </Tooltip>
  );
});

ControlLayerControlAdapterModel.displayName = 'ControlLayerControlAdapterModel';
