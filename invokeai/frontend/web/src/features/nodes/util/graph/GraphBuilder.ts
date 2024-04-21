import { NEGATIVE_CONDITIONING_COLLECT, POSITIVE_CONDITIONING_COLLECT } from 'features/nodes/util/graph/constants';
import type {
  AnyInvocation,
  AnyInvocationInputField,
  AnyInvocationOutputField,
  CollectInvocation,
  DenoiseLatentsInvocation,
  InvocationInputFields,
  InvocationOutputFields,
  InvocationType,
  S,
} from 'services/api/types';
import type { O } from 'ts-toolbelt';
import { assert } from 'tsafe';
import { v4 as uuidv4 } from 'uuid';

type Graph = O.NonNullable<O.Required<S['Graph']>>;
type Edge = Graph['edges'][number];
type Never = Record<string, never>;

// const zNodeFieldIdentifier = z.object({
//   node_id: z.string().min(1),
//   field: z.string().min(1),
// });
// const zEdge = z.object({
//   source: zNodeFieldIdentifier,
//   destination: zNodeFieldIdentifier,
// });
// const isEdge = (edge: unknown): edge is Edge => zEdge.safeParse(edge).success;

export class GraphBuilder {
  _graph: Graph;
  _baseModel: 'sd-1' | 'sdxl';
  _denoiseNode?: DenoiseLatentsInvocation;
  _posCondCollect: CollectInvocation;
  _negCondCollect: CollectInvocation;

  constructor(id?: string, baseModel?: 'sd-1' | 'sdxl') {
    this._graph = {
      id: id ?? uuidv4(),
      nodes: {},
      edges: [],
    };
    this._posCondCollect = this.addNode({
      id: POSITIVE_CONDITIONING_COLLECT,
      type: 'collect',
    });
    this._negCondCollect = this.addNode({
      id: NEGATIVE_CONDITIONING_COLLECT,
      type: 'collect',
    });
    this._baseModel = baseModel ?? 'sd-1';
  }

  static fromGraph(graph: Partial<Graph>): GraphBuilder {
    const builder = new this(graph.id ?? uuidv4());
    builder._graph = {
      id: builder._graph.id,
      nodes: graph.nodes ?? {},
      edges: graph.edges ?? [],
    };
    return builder;
  }

  isSDXL(): boolean {
    return this._baseModel === 'sdxl';
  }

  addNode<T extends AnyInvocation>(node: T): T {
    assert(this._graph.nodes[node.id] === undefined, `Node with id ${node.id} already exists`);
    if (node.is_intermediate === undefined) {
      node.is_intermediate = true;
    }
    if (node.use_cache === undefined) {
      node.use_cache = true;
    }
    this._graph.nodes[node.id] = node;
    return node;
  }

  addDenoiseNode(node: DenoiseLatentsInvocation): DenoiseLatentsInvocation {
    this._denoiseNode = this.addNode(node);
    this.addEdge<'collect', 'denoise_latents'>(
      this._posCondCollect.id,
      'collection',
      this._denoiseNode.id,
      'positive_conditioning'
    );
    this.addEdge<'collect', 'denoise_latents'>(
      this._negCondCollect.id,
      'collection',
      this._denoiseNode.id,
      'negative_conditioning'
    );
    return this._denoiseNode;
  }

  getDenoiseNode(): DenoiseLatentsInvocation {
    assert(this._denoiseNode, 'Denoise node not found');
    return this._denoiseNode;
  }

  addEdge<TFrom extends InvocationType | Never = Never, TTo extends InvocationType | Never = Never>(
    fromNode: string,
    fromField: TFrom extends InvocationType ? InvocationOutputFields<TFrom> : AnyInvocationOutputField,
    toNode: string,
    toField: TTo extends InvocationType ? InvocationInputFields<TTo> : AnyInvocationInputField
  ): Edge {
    const edge = {
      source: { node_id: fromNode, field: fromField },
      destination: { node_id: toNode, field: toField },
    };
    this._graph.edges.push(edge);
    return edge;
  }

  getNode<T extends InvocationType>(id: string, type?: T): Extract<AnyInvocation, { type: T }> {
    const node = this._graph.nodes[id];
    assert(node !== undefined, `Node with id ${id} not found`);
    if (type) {
      assert(node.type === type, `Node with id ${id} is not of type ${type}`);
    }
    return node as Extract<AnyInvocation, { type: T }>;
  }

  getNodeSafe<T extends InvocationType>(id: string, type?: T): Extract<AnyInvocation, { type: T }> | undefined {
    try {
      return this.getNode(id, type);
    } catch {
      return undefined;
    }
  }

  hasNode(id: string, type?: InvocationType): boolean {
    try {
      this.getNode(id, type);
      return true;
    } catch {
      return false;
    }
  }

  getEdge<TFrom extends InvocationType | Never = Never, TTo extends InvocationType | Never = Never>(
    fromNode: string,
    fromField: TFrom extends InvocationType ? InvocationOutputFields<TFrom> : AnyInvocationOutputField,
    toNode: string,
    toField: TTo extends InvocationType ? InvocationInputFields<TTo> : AnyInvocationInputField
  ): Edge {
    const edge = this._graph.edges.find(
      (e) =>
        e.source.node_id === fromNode &&
        e.source.field === fromField &&
        e.destination.node_id === toNode &&
        e.destination.field === toField
    );
    assert(edge !== undefined, `Edge from ${fromNode}.${fromField} to ${toNode}.${toField} not found`);
    return edge;
  }

  getEdgeSafe<TFrom extends InvocationType | Never = Never, TTo extends InvocationType | Never = Never>(
    fromNode: string,
    fromField: TFrom extends InvocationType ? InvocationOutputFields<TFrom> : AnyInvocationOutputField,
    toNode: string,
    toField: TTo extends InvocationType ? InvocationInputFields<TTo> : AnyInvocationInputField
  ): Edge | undefined {
    try {
      return this.getEdge(fromNode, fromField, toNode, toField);
    } catch {
      return undefined;
    }
  }

  hasEdge<TFrom extends InvocationType | Never = Never, TTo extends InvocationType | Never = Never>(
    fromNode: string,
    fromField: TFrom extends InvocationType ? InvocationOutputFields<TFrom> : AnyInvocationOutputField,
    toNode: string,
    toField: TTo extends InvocationType ? InvocationInputFields<TTo> : AnyInvocationInputField
  ): boolean {
    try {
      this.getEdge(fromNode, fromField, toNode, toField);
      return true;
    } catch {
      return false;
    }
  }

  // getIncomers(nodeId: string): Node[] {
  //   return this.graph.edges
  //     .filter((edge) => edge.destination.node_id === nodeId)
  //     .map((edge) => this.getNode(edge.source.node_id));
  // }

  // getOutgoers(nodeId: string): Node[] {
  //   return this.graph.edges
  //     .filter((edge) => edge.source.node_id === nodeId)
  //     .map((edge) => this.getNode(edge.destination.node_id));
  // }

  // getEdgesFrom(fromNode: string, fromField?: string): Edge[] {
  //   let edges = this.graph.edges.filter((edge) => edge.source.node_id === fromNode);
  //   if (fromField) {
  //     edges = edges.filter((edge) => edge.source.field === fromField);
  //   }
  //   return edges;
  // }

  // getEdgesTo(toNode: string, toField?: string): Edge[] {
  //   let edges = this.graph.edges.filter((edge) => edge.destination.node_id === toNode);
  //   if (toField) {
  //     edges = edges.filter((edge) => edge.destination.field === toField);
  //   }
  //   return edges;
  // }
}
