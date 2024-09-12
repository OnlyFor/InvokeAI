import { IconButton, Menu, MenuButton, MenuItem, MenuList } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import {
  useAddControlLayer,
  useAddInpaintMask,
  useAddIPAdapter,
  useAddRasterLayer,
  useAddRegionalGuidance,
} from 'features/controlLayers/hooks/addLayerHooks';
import { selectIsFLUX } from 'features/controlLayers/store/paramsSlice';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiPlusBold } from 'react-icons/pi';

export const EntityListGlobalActionBarAddLayerMenu = memo(() => {
  const { t } = useTranslation();
  const addInpaintMask = useAddInpaintMask();
  const addRegionalGuidance = useAddRegionalGuidance();
  const addRasterLayer = useAddRasterLayer();
  const addControlLayer = useAddControlLayer();
  const addIPAdapter = useAddIPAdapter();
  const isFLUX = useAppSelector(selectIsFLUX);

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        size="sm"
        variant="link"
        alignSelf="stretch"
        tooltip={t('controlLayers.addLayer')}
        aria-label={t('controlLayers.addLayer')}
        icon={<PiPlusBold />}
        data-testid="control-layers-add-layer-menu-button"
      />
      <MenuList>
        <MenuItem icon={<PiPlusBold />} onClick={addInpaintMask}>
          {t('controlLayers.inpaintMask')}
        </MenuItem>
        <MenuItem icon={<PiPlusBold />} onClick={addRegionalGuidance} isDisabled={isFLUX}>
          {t('controlLayers.regionalGuidance')}
        </MenuItem>
        <MenuItem icon={<PiPlusBold />} onClick={addRasterLayer}>
          {t('controlLayers.rasterLayer')}
        </MenuItem>
        <MenuItem icon={<PiPlusBold />} onClick={addControlLayer} isDisabled={isFLUX}>
          {t('controlLayers.controlLayer')}
        </MenuItem>
        <MenuItem icon={<PiPlusBold />} onClick={addIPAdapter} isDisabled={isFLUX}>
          {t('controlLayers.globalIPAdapter')}
        </MenuItem>
      </MenuList>
    </Menu>
  );
});

EntityListGlobalActionBarAddLayerMenu.displayName = 'EntityListGlobalActionBarAddLayerMenu';
