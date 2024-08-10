import type { HandleType } from '@xyflow/react';
import type { CollapsedEdge } from 'features/nodes/components/flow/edges/InvocationCollapsedEdge';
import type {
  FieldIdentifier,
  FieldInputTemplate,
  FieldOutputTemplate,
  StatefulFieldValue,
} from 'features/nodes/types/field';
import type {
  AppNode,
  InvocationNodeEdge,
  InvocationTemplate,
  NodeExecutionState,
} from 'features/nodes/types/invocation';
import type { WorkflowV3 } from 'features/nodes/types/workflow';

export type Templates = Record<string, InvocationTemplate>;
export type NodeExecutionStates = Record<string, NodeExecutionState | undefined>;

export type PendingConnection = {
  nodeId: string;
  handleId: string;
  handleType: HandleType;
  fieldTemplate: FieldInputTemplate | FieldOutputTemplate;
};

export type NodesState = {
  _version: 1;
  nodes: AppNode[];
  edges: (InvocationNodeEdge | CollapsedEdge)[];
};

export type WorkflowMode = 'edit' | 'view';
export type FieldIdentifierWithValue = FieldIdentifier & {
  value: StatefulFieldValue;
};

export type WorkflowsState = Omit<WorkflowV3, 'nodes' | 'edges'> & {
  _version: 1;
  isTouched: boolean;
  mode: WorkflowMode;
  originalExposedFieldValues: FieldIdentifierWithValue[];
};
