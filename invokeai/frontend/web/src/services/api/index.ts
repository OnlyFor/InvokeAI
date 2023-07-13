import { FullTagDescription } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { $authToken, $baseUrl } from 'services/api/client';

export type { AddInvocation } from './models/AddInvocation';
export type { BoardChanges } from './models/BoardChanges';
export type { BoardDTO } from './models/BoardDTO';
export type { Body_create_board_image } from './models/Body_create_board_image';
export type { Body_remove_board_image } from './models/Body_remove_board_image';
export type { Body_upload_image } from './models/Body_upload_image';
export type { CannyImageProcessorInvocation } from './models/CannyImageProcessorInvocation';
export type { CkptModelInfo } from './models/CkptModelInfo';
export type { ClipField } from './models/ClipField';
export type { CollectInvocation } from './models/CollectInvocation';
export type { CollectInvocationOutput } from './models/CollectInvocationOutput';
export type { ColorField } from './models/ColorField';
export type { CompelInvocation } from './models/CompelInvocation';
export type { CompelOutput } from './models/CompelOutput';
export type { ConditioningField } from './models/ConditioningField';
export type { ContentShuffleImageProcessorInvocation } from './models/ContentShuffleImageProcessorInvocation';
export type { ControlField } from './models/ControlField';
export type { ControlNetInvocation } from './models/ControlNetInvocation';
export type { ControlNetModelConfig } from './models/ControlNetModelConfig';
export type { ControlOutput } from './models/ControlOutput';
export type { CreateModelRequest } from './models/CreateModelRequest';
export type { CvInpaintInvocation } from './models/CvInpaintInvocation';
export type { DiffusersModelInfo } from './models/DiffusersModelInfo';
export type { DivideInvocation } from './models/DivideInvocation';
export type { DynamicPromptInvocation } from './models/DynamicPromptInvocation';
export type { Edge } from './models/Edge';
export type { EdgeConnection } from './models/EdgeConnection';
export type { FloatCollectionOutput } from './models/FloatCollectionOutput';
export type { FloatLinearRangeInvocation } from './models/FloatLinearRangeInvocation';
export type { FloatOutput } from './models/FloatOutput';
export type { Graph } from './models/Graph';
export type { GraphExecutionState } from './models/GraphExecutionState';
export type { GraphInvocation } from './models/GraphInvocation';
export type { GraphInvocationOutput } from './models/GraphInvocationOutput';
export type { HTTPValidationError } from './models/HTTPValidationError';
export type { ImageBlurInvocation } from './models/ImageBlurInvocation';
export type { ImageChannelInvocation } from './models/ImageChannelInvocation';
export type { ImageConvertInvocation } from './models/ImageConvertInvocation';
export type { ImageCropInvocation } from './models/ImageCropInvocation';
export type { ImageDTO } from './models/ImageDTO';
export type { ImageField } from './models/ImageField';
export type { ImageInverseLerpInvocation } from './models/ImageInverseLerpInvocation';
export type { ImageLerpInvocation } from './models/ImageLerpInvocation';
export type { ImageMetadata } from './models/ImageMetadata';
export type { ImageMultiplyInvocation } from './models/ImageMultiplyInvocation';
export type { ImageOutput } from './models/ImageOutput';
export type { ImagePasteInvocation } from './models/ImagePasteInvocation';
export type { ImageProcessorInvocation } from './models/ImageProcessorInvocation';
export type { ImageRecordChanges } from './models/ImageRecordChanges';
export type { ImageResizeInvocation } from './models/ImageResizeInvocation';
export type { ImageScaleInvocation } from './models/ImageScaleInvocation';
export type { ImageToLatentsInvocation } from './models/ImageToLatentsInvocation';
export type { ImageUrlsDTO } from './models/ImageUrlsDTO';
export type { InfillColorInvocation } from './models/InfillColorInvocation';
export type { InfillPatchMatchInvocation } from './models/InfillPatchMatchInvocation';
export type { InfillTileInvocation } from './models/InfillTileInvocation';
export type { InpaintInvocation } from './models/InpaintInvocation';
export type { IntCollectionOutput } from './models/IntCollectionOutput';
export type { IntOutput } from './models/IntOutput';
export type { IterateInvocation } from './models/IterateInvocation';
export type { IterateInvocationOutput } from './models/IterateInvocationOutput';
export type { LatentsField } from './models/LatentsField';
export type { LatentsOutput } from './models/LatentsOutput';
export type { LatentsToImageInvocation } from './models/LatentsToImageInvocation';
export type { LatentsToLatentsInvocation } from './models/LatentsToLatentsInvocation';
export type { LineartAnimeImageProcessorInvocation } from './models/LineartAnimeImageProcessorInvocation';
export type { LineartImageProcessorInvocation } from './models/LineartImageProcessorInvocation';
export type { LoadImageInvocation } from './models/LoadImageInvocation';
export type { LoraInfo } from './models/LoraInfo';
export type { LoraLoaderInvocation } from './models/LoraLoaderInvocation';
export type { LoraLoaderOutput } from './models/LoraLoaderOutput';
export type { MaskFromAlphaInvocation } from './models/MaskFromAlphaInvocation';
export type { MaskOutput } from './models/MaskOutput';
export type { MediapipeFaceProcessorInvocation } from './models/MediapipeFaceProcessorInvocation';
export type { MidasDepthImageProcessorInvocation } from './models/MidasDepthImageProcessorInvocation';
export type { MlsdImageProcessorInvocation } from './models/MlsdImageProcessorInvocation';
export type { ModelInfo } from './models/ModelInfo';
export type { ModelLoaderOutput } from './models/ModelLoaderOutput';
export type { ModelsList } from './models/ModelsList';
export type { ModelType } from './models/ModelType';
export type { MultiplyInvocation } from './models/MultiplyInvocation';
export type { NoiseInvocation } from './models/NoiseInvocation';
export type { NoiseOutput } from './models/NoiseOutput';
export type { NormalbaeImageProcessorInvocation } from './models/NormalbaeImageProcessorInvocation';
export type { OffsetPaginatedResults_BoardDTO_ } from './models/OffsetPaginatedResults_BoardDTO_';
export type { OffsetPaginatedResults_ImageDTO_ } from './models/OffsetPaginatedResults_ImageDTO_';
export type { ONNXLatentsToImageInvocation } from './models/ONNXLatentsToImageInvocation';
export type { ONNXModelLoaderOutput } from './models/ONNXModelLoaderOutput';
export type { ONNXPromptInvocation } from './models/ONNXPromptInvocation';
export type { ONNXSD1ModelLoaderInvocation } from './models/ONNXSD1ModelLoaderInvocation';
export type { ONNXStableDiffusion1ModelConfig } from './models/ONNXStableDiffusion1ModelConfig';
export type { ONNXStableDiffusion2ModelConfig } from './models/ONNXStableDiffusion2ModelConfig';
export type { ONNXTextToLatentsInvocation } from './models/ONNXTextToLatentsInvocation';
export type { OpenposeImageProcessorInvocation } from './models/OpenposeImageProcessorInvocation';
export type { PaginatedResults_GraphExecutionState_ } from './models/PaginatedResults_GraphExecutionState_';
export type { ParamFloatInvocation } from './models/ParamFloatInvocation';
export type { ParamIntInvocation } from './models/ParamIntInvocation';
export type { PidiImageProcessorInvocation } from './models/PidiImageProcessorInvocation';
export type { PipelineModelField } from './models/PipelineModelField';
export type { PipelineModelLoaderInvocation } from './models/PipelineModelLoaderInvocation';
export type { PromptCollectionOutput } from './models/PromptCollectionOutput';
export type { PromptOutput } from './models/PromptOutput';
export type { RandomIntInvocation } from './models/RandomIntInvocation';
export type { RandomRangeInvocation } from './models/RandomRangeInvocation';
export type { RangeInvocation } from './models/RangeInvocation';
export type { RangeOfSizeInvocation } from './models/RangeOfSizeInvocation';
export type { ResizeLatentsInvocation } from './models/ResizeLatentsInvocation';
export type { RestoreFaceInvocation } from './models/RestoreFaceInvocation';
export type { ScaleLatentsInvocation } from './models/ScaleLatentsInvocation';
export type { ShowImageInvocation } from './models/ShowImageInvocation';
export type { StableDiffusion1ModelCheckpointConfig } from './models/StableDiffusion1ModelCheckpointConfig';
export type { StableDiffusion1ModelDiffusersConfig } from './models/StableDiffusion1ModelDiffusersConfig';
export type { StableDiffusion2ModelCheckpointConfig } from './models/StableDiffusion2ModelCheckpointConfig';
export type { StableDiffusion2ModelDiffusersConfig } from './models/StableDiffusion2ModelDiffusersConfig';
export type { StepParamEasingInvocation } from './models/StepParamEasingInvocation';
export type { SubModelType } from './models/SubModelType';
export type { SubtractInvocation } from './models/SubtractInvocation';
export type { TextToLatentsInvocation } from './models/TextToLatentsInvocation';
export type { TextualInversionModelConfig } from './models/TextualInversionModelConfig';
export type { UNetField } from './models/UNetField';
export type { UpscaleInvocation } from './models/UpscaleInvocation';
export type { VaeField } from './models/VaeField';
export type { VaeModelConfig } from './models/VaeModelConfig';
export type { VaeRepo } from './models/VaeRepo';
export type { ValidationError } from './models/ValidationError';
export type { ZoeDepthImageProcessorInvocation } from './models/ZoeDepthImageProcessorInvocation';
export const tagTypes = ['Board', 'Image', 'ImageMetadata', 'Model'];
export type ApiFullTagDescription = FullTagDescription<
  (typeof tagTypes)[number]
>;
export const LIST_TAG = 'LIST';

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseUrl = $baseUrl.get();
  const authToken = $authToken.get();

  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${baseUrl ?? ''}/api/v1`,
    prepareHeaders: (headers) => {
      if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
      }

      return headers;
    },
  });

  return rawBaseQuery(args, api, extraOptions);
};

export const api = createApi({
  baseQuery: dynamicBaseQuery,
  reducerPath: 'api',
  tagTypes,
  endpoints: () => ({}),
});
