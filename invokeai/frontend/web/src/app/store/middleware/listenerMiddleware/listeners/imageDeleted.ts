import { logger } from 'app/logging/logger';
import type { AppStartListening } from 'app/store/middleware/listenerMiddleware';
import type { AppDispatch, RootState } from 'app/store/store';
import { resetCanvas } from 'features/canvas/store/canvasSlice';
import {
  caImageChanged,
  caProcessedImageChanged,
  ipaImageChanged,
  layerDeleted,
} from 'features/controlLayers/store/canvasV2Slice';
import { imageDeletionConfirmed } from 'features/deleteImageModal/store/actions';
import { isModalOpenChanged } from 'features/deleteImageModal/store/slice';
import { selectListImagesQueryArgs } from 'features/gallery/store/gallerySelectors';
import { imageSelected } from 'features/gallery/store/gallerySlice';
import { fieldImageValueChanged } from 'features/nodes/store/nodesSlice';
import { isImageFieldInputInstance } from 'features/nodes/types/field';
import { isInvocationNode } from 'features/nodes/types/invocation';
import { forEach } from 'lodash-es';
import { api } from 'services/api';
import { imagesApi } from 'services/api/endpoints/images';
import type { ImageDTO } from 'services/api/types';

const deleteNodesImages = (state: RootState, dispatch: AppDispatch, imageDTO: ImageDTO) => {
  state.nodes.present.nodes.forEach((node) => {
    if (!isInvocationNode(node)) {
      return;
    }

    forEach(node.data.inputs, (input) => {
      if (isImageFieldInputInstance(input) && input.value?.image_name === imageDTO.image_name) {
        dispatch(
          fieldImageValueChanged({
            nodeId: node.data.id,
            fieldName: input.name,
            value: undefined,
          })
        );
      }
    });
  });
};

const deleteControlAdapterImages = (state: RootState, dispatch: AppDispatch, imageDTO: ImageDTO) => {
  state.canvasV2.controlAdapters.forEach(({ id, image, processedImage }) => {
    if (image?.name === imageDTO.image_name || processedImage?.name === imageDTO.image_name) {
      dispatch(caImageChanged({ id, imageDTO: null }));
      dispatch(caProcessedImageChanged({ id, imageDTO: null }));
    }
  });
};

const deleteIPAdapterImages = (state: RootState, dispatch: AppDispatch, imageDTO: ImageDTO) => {
  state.canvasV2.ipAdapters.forEach(({ id, image }) => {
    if (image?.name === imageDTO.image_name) {
      dispatch(ipaImageChanged({ id, imageDTO: null }));
    }
  });
};

const deleteLayerImages = (state: RootState, dispatch: AppDispatch, imageDTO: ImageDTO) => {
  state.canvasV2.layers.forEach(({ id, objects }) => {
    let shouldDelete = false;
    for (const obj of objects) {
      if (obj.type === 'image' && obj.image.name === imageDTO.image_name) {
        shouldDelete = true;
        break;
      }
    }
    if (shouldDelete) {
      dispatch(layerDeleted({ id }));
    }
  });
};

export const addRequestedSingleImageDeletionListener = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: imageDeletionConfirmed,
    effect: async (action, { dispatch, getState, condition }) => {
      const { imageDTOs, imagesUsage } = action.payload;

      if (imageDTOs.length !== 1 || imagesUsage.length !== 1) {
        // handle multiples in separate listener
        return;
      }

      const imageDTO = imageDTOs[0];
      const imageUsage = imagesUsage[0];

      if (!imageDTO || !imageUsage) {
        // satisfy noUncheckedIndexedAccess
        return;
      }

      dispatch(isModalOpenChanged(false));
      const state = getState();

      // We need to reset the features where the image is in use - none of these work if their image(s) don't exist
      if (imageUsage.isLayerImage) {
        dispatch(resetCanvas());
      }

      imageDTOs.forEach((imageDTO) => {
        deleteNodesImages(state, dispatch, imageDTO);
        deleteControlAdapterImages(state, dispatch, imageDTO);
        deleteIPAdapterImages(state, dispatch, imageDTO);
        deleteLayerImages(state, dispatch, imageDTO);
      });

      // Delete from server
      const { requestId } = dispatch(imagesApi.endpoints.deleteImage.initiate(imageDTO));

      // Wait for successful deletion, then trigger boards to re-fetch
      const wasImageDeleted = await condition(
        (action) => imagesApi.endpoints.deleteImage.matchFulfilled(action) && action.meta.requestId === requestId,
        30000
      );

      if (wasImageDeleted) {
        dispatch(api.util.invalidateTags([{ type: 'Board', id: imageDTO.board_id ?? 'none' }]));
      }

      const lastSelectedImage = state.gallery.selection[state.gallery.selection.length - 1]?.image_name;

      if (imageDTO && imageDTO?.image_name === lastSelectedImage) {
        const baseQueryArgs = selectListImagesQueryArgs(state);
        const { data } = imagesApi.endpoints.listImages.select(baseQueryArgs)(state);

        if (data && data.items) {
          const newlySelectedImage = data?.items.find((img) => img.image_name !== imageDTO?.image_name);
          dispatch(imageSelected(newlySelectedImage || null));
        } else {
          dispatch(imageSelected(null));
        }
      }
    },
  });

  startAppListening({
    actionCreator: imageDeletionConfirmed,
    effect: async (action, { dispatch, getState }) => {
      const { imageDTOs, imagesUsage } = action.payload;

      if (imageDTOs.length <= 1 || imagesUsage.length <= 1) {
        // handle singles in separate listener
        return;
      }

      try {
        // Delete from server
        await dispatch(imagesApi.endpoints.deleteImages.initiate({ imageDTOs })).unwrap();
        const state = getState();
        const queryArgs = selectListImagesQueryArgs(state);
        const { data } = imagesApi.endpoints.listImages.select(queryArgs)(state);

        if (data && data.items[0]) {
          dispatch(imageSelected(data.items[0]));
        } else {
          dispatch(imageSelected(null));
        }

        dispatch(isModalOpenChanged(false));

        // We need to reset the features where the image is in use - none of these work if their image(s) don't exist

        if (imagesUsage.some((i) => i.isLayerImage)) {
          dispatch(resetCanvas());
        }

        imageDTOs.forEach((imageDTO) => {
          deleteNodesImages(state, dispatch, imageDTO);
          deleteControlAdapterImages(state, dispatch, imageDTO);
          deleteIPAdapterImages(state, dispatch, imageDTO);
          deleteLayerImages(state, dispatch, imageDTO);
        });
      } catch {
        // no-op
      }
    },
  });

  startAppListening({
    matcher: imagesApi.endpoints.deleteImage.matchPending,
    effect: () => {
      //
    },
  });

  startAppListening({
    matcher: imagesApi.endpoints.deleteImage.matchFulfilled,
    effect: (action) => {
      const log = logger('images');
      log.debug({ imageDTO: action.meta.arg.originalArgs }, 'Image deleted');
    },
  });

  startAppListening({
    matcher: imagesApi.endpoints.deleteImage.matchRejected,
    effect: (action) => {
      const log = logger('images');
      log.debug({ imageDTO: action.meta.arg.originalArgs }, 'Unable to delete image');
    },
  });
};
