import type {
  BoardField,
  Classification,
  ColorField,
  ControlField,
  ImageField,
  ImageOutput,
  IPAdapterField,
  ModelIdentifierField,
  ProgressImage,
  SchedulerField,
  T2IAdapterField,
} from 'features/nodes/types/common';
import type { Invocation, S } from 'services/api/types';
import type { Equals, Extends } from 'tsafe';
import { assert } from 'tsafe';
import { describe, test } from 'vitest';

/**
 * These types originate from the server and are recreated as zod schemas manually, for use at runtime.
 * The tests ensure that the types are correctly recreated.
 */

describe('Common types', () => {
  // Complex field types
  test('ImageField', () => assert<Equals<ImageField, S['ImageField']>>());
  test('BoardField', () => assert<Equals<BoardField, S['BoardField']>>());
  test('ColorField', () => assert<Equals<ColorField, S['ColorField']>>());
  test('SchedulerField', () => assert<Equals<SchedulerField, NonNullable<Invocation<'scheduler'>['scheduler']>>>());
  test('ControlField', () => assert<Equals<ControlField, S['ControlField']>>());
  // @ts-expect-error TODO(psyche): fix types
  test('IPAdapterField', () => assert<Extends<IPAdapterField, S['IPAdapterField']>>());
  test('T2IAdapterField', () => assert<Equals<T2IAdapterField, S['T2IAdapterField']>>());

  // Model component types
  test('ModelIdentifier', () => assert<Equals<ModelIdentifierField, S['ModelIdentifierField']>>());

  // Misc types
  test('ProgressImage', () => assert<Equals<ProgressImage, S['ProgressImage']>>());
  test('ImageOutput', () => assert<Equals<ImageOutput, S['ImageOutput']>>());
  test('Classification', () => assert<Equals<Classification, S['Classification']>>());
});
