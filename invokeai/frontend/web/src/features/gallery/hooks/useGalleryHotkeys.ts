import { useAppSelector } from 'app/store/storeHooks';
import { useGalleryNavigation } from 'features/gallery/hooks/useGalleryNavigation';
import { useGalleryPagination } from 'features/gallery/hooks/useGalleryPagination';
import { selectListImagesQueryArgs } from 'features/gallery/store/gallerySelectors';
import { useHotkeys } from 'react-hotkeys-hook';
import { useListImagesQuery } from 'services/api/endpoints/images';

/**
 * Registers gallery hotkeys. This hook is a singleton.
 */
export const useGalleryHotkeys = () => {
  // TODO(psyche): Hotkeys when staging - cannot navigate gallery with arrow keys when staging!

  const { goNext, goPrev, isNextEnabled, isPrevEnabled } = useGalleryPagination();
  const queryArgs = useAppSelector(selectListImagesQueryArgs);
  const queryResult = useListImagesQuery(queryArgs);

  const {
    handleLeftImage,
    handleRightImage,
    handleUpImage,
    handleDownImage,
    areImagesBelowCurrent,
    isOnFirstImageOfView,
    isOnLastImageOfView,
  } = useGalleryNavigation();

  useHotkeys(
    ['left', 'alt+left'],
    (e) => {
      if (isOnFirstImageOfView && isPrevEnabled && !queryResult.isFetching) {
        goPrev();
        return;
      }
      handleLeftImage(e.altKey);
    },
    [handleLeftImage, isOnFirstImageOfView, goPrev, isPrevEnabled, queryResult.isFetching]
  );

  useHotkeys(
    ['right', 'alt+right'],
    (e) => {
      if (isOnLastImageOfView && isNextEnabled && !queryResult.isFetching) {
        goNext();
        return;
      }
      if (!isOnLastImageOfView) {
        handleRightImage(e.altKey);
      }
    },
    [isOnLastImageOfView, goNext, isNextEnabled, queryResult.isFetching, handleRightImage]
  );

  useHotkeys(
    ['up', 'alt+up'],
    (e) => {
      handleUpImage(e.altKey);
    },
    { preventDefault: true },
    [handleUpImage]
  );

  useHotkeys(
    ['down', 'alt+down'],
    (e) => {
      if (!areImagesBelowCurrent && isNextEnabled && !queryResult.isFetching) {
        goNext();
        return;
      }
      handleDownImage(e.altKey);
    },
    { preventDefault: true },
    [areImagesBelowCurrent, goNext, isNextEnabled, queryResult.isFetching, handleDownImage]
  );
};
