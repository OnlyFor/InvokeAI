import {
  NEGATIVE_CONDITIONING,
  NEGATIVE_CONDITIONING_COLLECT,
  POSITIVE_CONDITIONING_COLLECT,
} from 'features/nodes/util/graph/constants';
import { GraphBuilder } from 'features/nodes/util/graph/GraphBuilder';
import type { DenoiseLatentsInvocation, Invocation } from 'services/api/types';
import { assert, AssertionError, is } from 'tsafe';
import { validate } from 'uuid';
import { describe, expect, it } from 'vitest';

describe('GraphBuilder', () => {
  describe('constructor', () => {
    it('should create a new graph with the correct id', () => {
      const graphBuilder = new GraphBuilder('test-id');
      expect(graphBuilder._graph.id).toBe('test-id');
    });
    it('should create a new graph with a uuid id if none is provided', () => {
      const graphBuilder = new GraphBuilder();
      expect(graphBuilder._graph.id).not.toBeUndefined();
      expect(validate(graphBuilder._graph.id)).toBeTruthy();
    });
    it('should create the positive and negative conditioning collect nodes', () => {
      const graphBuilder = new GraphBuilder();
      expect(graphBuilder._graph.nodes[POSITIVE_CONDITIONING_COLLECT]).not.toBeUndefined();
      expect(graphBuilder._graph.nodes[NEGATIVE_CONDITIONING_COLLECT]).not.toBeUndefined();
      expect(graphBuilder._graph.nodes[POSITIVE_CONDITIONING_COLLECT]?.type).toBe('collect');
      expect(graphBuilder._graph.nodes[NEGATIVE_CONDITIONING_COLLECT]?.type).toBe('collect');
      expect(graphBuilder._posCondCollect).toBe(graphBuilder._graph.nodes[POSITIVE_CONDITIONING_COLLECT]);
      expect(graphBuilder._negCondCollect).toBe(graphBuilder._graph.nodes[NEGATIVE_CONDITIONING_COLLECT]);
    });
    it('should set the base model to sd-1 if none is provided', () => {
      const graphBuilder = new GraphBuilder();
      expect(graphBuilder._baseModel).toBe('sd-1');
    });
    it('should set the base model to the provided value', () => {
      const graphBuilder = new GraphBuilder(undefined, 'sdxl');
      expect(graphBuilder._baseModel).toBe('sdxl');
    });
  });

  describe('addNode', () => {
    const testNode = {
      id: 'test-node',
      type: 'add',
    } as const;
    it('should add a node to the graph', () => {
      const graphBuilder = new GraphBuilder();
      graphBuilder.addNode(testNode);
      expect(graphBuilder._graph.nodes['test-node']).not.toBeUndefined();
      expect(graphBuilder._graph.nodes['test-node']?.type).toBe('add');
    });
    it('should set is_intermediate to true if not provided', () => {
      const graphBuilder = new GraphBuilder();
      graphBuilder.addNode(testNode);
      expect(graphBuilder._graph.nodes['test-node']?.is_intermediate).toBe(true);
    });
    it('should not overwrite is_intermediate if provided', () => {
      const graphBuilder = new GraphBuilder();
      graphBuilder.addNode({
        ...testNode,
        is_intermediate: false,
      });
      expect(graphBuilder._graph.nodes['test-node']?.is_intermediate).toBe(false);
    });
    it('should set use_cache to true if not provided', () => {
      const graphBuilder = new GraphBuilder();
      graphBuilder.addNode(testNode);
      expect(graphBuilder._graph.nodes['test-node']?.use_cache).toBe(true);
    });
    it('should not overwrite use_cache if provided', () => {
      const graphBuilder = new GraphBuilder();
      graphBuilder.addNode({
        ...testNode,
        use_cache: false,
      });
      expect(graphBuilder._graph.nodes['test-node']?.use_cache).toBe(false);
    });
    it('should error if the node id is already in the graph', () => {
      const graphBuilder = new GraphBuilder();
      graphBuilder.addNode(testNode);
      expect(() => graphBuilder.addNode(testNode)).toThrowError(AssertionError);
    });
  });

  describe('denoise methods', () => {
    const denoiseNode: DenoiseLatentsInvocation = {
      id: 'test-node',
      type: 'denoise_latents',
    };
    describe('addDenoiseNode', () => {
      it('should add the node and set the _denoiseNode attr', () => {
        const graphBuilder = new GraphBuilder();
        graphBuilder.addDenoiseNode(denoiseNode);
        expect(graphBuilder._denoiseNode).toBe(denoiseNode);
      });
      it('should connect the conditioning collectors', () => {
        const graphBuilder = new GraphBuilder();
        graphBuilder.addDenoiseNode(denoiseNode);
        expect(
          graphBuilder.hasEdge<'collect', 'denoise_latents'>(
            graphBuilder._posCondCollect.id,
            'collection',
            denoiseNode.id,
            'positive_conditioning'
          )
        ).toBe(true);
        expect(
          graphBuilder.hasEdge<'collect', 'denoise_latents'>(
            graphBuilder._negCondCollect.id,
            'collection',
            denoiseNode.id,
            'negative_conditioning'
          )
        ).toBe(true);
      });
    });
    describe('getDenoiseNode', () => {
      it('should return the denoise node', () => {
        const graphBuilder = new GraphBuilder();
        graphBuilder.addDenoiseNode(denoiseNode);
        expect(graphBuilder.getDenoiseNode()).toBe(denoiseNode);
      });
      it('should throw an error if the denoise node is not found', () => {
        const graphBuilder = new GraphBuilder();
        expect(() => graphBuilder.getDenoiseNode()).toThrowError(AssertionError);
      });
    });
  });

  describe('addEdge', () => {
    it('should add an edge to the graph with the provided values', () => {
      const graphBuilder = new GraphBuilder();
      graphBuilder.addEdge<'add', 'sub'>('from-node', 'value', 'to-node', 'b');
      expect(graphBuilder._graph.edges.length).toBe(1);
      expect(graphBuilder._graph.edges[0]).toEqual({
        source: { node_id: 'from-node', field: 'value' },
        destination: { node_id: 'to-node', field: 'b' },
      });
    });
    it('should infer field names', () => {
      const graphBuilder = new GraphBuilder();
      // @ts-expect-error The first field must be a valid output field of the first type arg
      graphBuilder.addEdge<'add', 'sub'>('from-node', 'not-a-valid-field', 'to-node', 'a');
      // @ts-expect-error The second field must be a valid input field of the second type arg
      graphBuilder.addEdge<'add', 'sub'>('from-node', 'value', 'to-node', 'not-a-valid-field');
      // @ts-expect-error The first field must be any valid output field
      graphBuilder.addEdge('from-node', 'not-a-valid-field', 'to-node', 'a');
      // @ts-expect-error The first field must be any valid input field
      graphBuilder.addEdge('from-node', 'clip', 'to-node', 'not-a-valid-field');
    });
  });

  describe('getNode', () => {
    const graphBuilder = new GraphBuilder();
    const node = graphBuilder.addNode({
      id: 'test-node',
      type: 'add',
    });

    it('should return the node with the provided id', () => {
      expect(graphBuilder.getNode('test-node')).toBe(node);
    });
    it('should return the node with the provided id and type', () => {
      expect(graphBuilder.getNode('test-node', 'add')).toBe(node);
      assert(is<Invocation<'add'>>(node));
    });
    it('should throw an error if the node is not found', () => {
      expect(() => graphBuilder.getNode('not-found')).toThrowError(AssertionError);
    });
    it('should throw an error if the node is found but has the wrong type', () => {
      expect(() => graphBuilder.getNode('test-node', 'sub')).toThrowError(AssertionError);
    });
  });

  describe('getNodeSafe', () => {
    const graphBuilder = new GraphBuilder();
    const node = graphBuilder.addNode({
      id: 'test-node',
      type: 'add',
    });
    it('should return the node if it is found', () => {
      expect(graphBuilder.getNodeSafe('test-node')).toBe(node);
    });
    it('should return the node if it is found with the provided type', () => {
      expect(graphBuilder.getNodeSafe('test-node')).toBe(node);
      assert(is<Invocation<'add'>>(node));
    });
    it("should return undefined if the node isn't found", () => {
      expect(graphBuilder.getNodeSafe('not-found')).toBeUndefined();
    });
    it('should return undefined if the node is found but has the wrong type', () => {
      expect(graphBuilder.getNodeSafe('test-node', 'sub')).toBeUndefined();
    });
  });

  describe('hasNode', () => {
    const graphBuilder = new GraphBuilder();
    graphBuilder.addNode({
      id: 'test-node',
      type: 'add',
    });

    it('should return true if the node is in the graph', () => {
      expect(graphBuilder.hasNode('test-node')).toBe(true);
    });
    it('should return false if the node is not in the graph', () => {
      expect(graphBuilder.hasNode('not-found')).toBe(false);
    });
    it('should return true if the node is in the graph with the provided type', () => {
      expect(graphBuilder.hasNode('test-node', 'add')).toBe(true);
    });
    it('should return false if the node is not in the graph with the provided type', () => {
      expect(graphBuilder.hasNode('test-node', 'sub')).toBe(false);
    });
  });

  describe('isSDXL', () => {
    it('should return true if the base model is sdxl', () => {
      const graphBuilder = new GraphBuilder(undefined, 'sdxl');
      expect(graphBuilder.isSDXL()).toBe(true);
    });
    it('should return false if the base model is not sdxl', () => {
      const graphBuilder = new GraphBuilder();
      expect(graphBuilder.isSDXL()).toBe(false);
    });
  });

  describe('getEdge', () => {
    const graphBuilder = new GraphBuilder();
    graphBuilder.addEdge<'add', 'sub'>('from-node', 'value', 'to-node', 'b');
    it('should return the edge with the provided values', () => {
      expect(graphBuilder.getEdge('from-node', 'value', 'to-node', 'b')).toEqual({
        source: { node_id: 'from-node', field: 'value' },
        destination: { node_id: 'to-node', field: 'b' },
      });
    });
    it('should throw an error if the edge is not found', () => {
      expect(() => graphBuilder.getEdge('from-node', 'value', 'to-node', 'a')).toThrowError(AssertionError);
    });
  });

  describe('getEdgeSafe', () => {
    const graphBuilder = new GraphBuilder();
    graphBuilder.addEdge<'add', 'sub'>('from-node', 'value', 'to-node', 'b');
    it('should return the edge if it is found', () => {
      expect(graphBuilder.getEdgeSafe('from-node', 'value', 'to-node', 'b')).toEqual({
        source: { node_id: 'from-node', field: 'value' },
        destination: { node_id: 'to-node', field: 'b' },
      });
    });
    it('should return undefined if the edge is not found', () => {
      expect(graphBuilder.getEdgeSafe('from-node', 'value', 'to-node', 'a')).toBeUndefined();
    });
  });

  describe('hasEdge', () => {
    const graphBuilder = new GraphBuilder();
    graphBuilder.addEdge<'add', 'sub'>('from-node', 'value', 'to-node', 'b');
    it('should return true if the edge is in the graph', () => {
      expect(graphBuilder.hasEdge('from-node', 'value', 'to-node', 'b')).toBe(true);
    });
    it('should return false if the edge is not in the graph', () => {
      expect(graphBuilder.hasEdge('from-node', 'value', 'to-node', 'a')).toBe(false);
    });
  });
});
