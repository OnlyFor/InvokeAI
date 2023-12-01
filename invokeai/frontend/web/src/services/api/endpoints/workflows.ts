import { paths } from 'services/api/schema';
import { LIST_TAG, api } from '..';

export const workflowsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWorkflow: build.query<
      paths['/api/v1/workflows/i/{workflow_id}']['get']['responses']['200']['content']['application/json'],
      string
    >({
      query: (workflow_id) => `workflows/i/${workflow_id}`,
      providesTags: (result, error, workflow_id) => [
        { type: 'Workflow', id: workflow_id },
      ],
      onQueryStarted: async (arg, api) => {
        const { dispatch, queryFulfilled } = api;
        try {
          await queryFulfilled;
          dispatch(
            workflowsApi.util.invalidateTags([
              { type: 'WorkflowsRecent', id: LIST_TAG },
            ])
          );
        } catch {
          // no-op
        }
      },
    }),
    deleteWorkflow: build.mutation<void, string>({
      query: (workflow_id) => ({
        url: `workflows/i/${workflow_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, workflow_id) => [
        { type: 'Workflow', id: LIST_TAG },
        { type: 'Workflow', id: workflow_id },
        { type: 'WorkflowsRecent', id: LIST_TAG },
      ],
    }),
    createWorkflow: build.mutation<
      paths['/api/v1/workflows/']['post']['responses']['200']['content']['application/json'],
      paths['/api/v1/workflows/']['post']['requestBody']['content']['application/json']['workflow']
    >({
      query: (workflow) => ({
        url: 'workflows/',
        method: 'POST',
        body: { workflow },
      }),
      invalidatesTags: [
        { type: 'Workflow', id: LIST_TAG },
        { type: 'WorkflowsRecent', id: LIST_TAG },
      ],
    }),
    updateWorkflow: build.mutation<
      paths['/api/v1/workflows/i/{workflow_id}']['patch']['responses']['200']['content']['application/json'],
      paths['/api/v1/workflows/i/{workflow_id}']['patch']['requestBody']['content']['application/json']['workflow']
    >({
      query: (workflow) => ({
        url: `workflows/i/${workflow.id}`,
        method: 'PATCH',
        body: { workflow },
      }),
      invalidatesTags: (response, error, workflow) => [
        { type: 'WorkflowsRecent', id: LIST_TAG },
        { type: 'Workflow', id: LIST_TAG },
        { type: 'Workflow', id: workflow.id },
      ],
    }),
    listWorkflows: build.query<
      paths['/api/v1/workflows/']['get']['responses']['200']['content']['application/json'],
      NonNullable<paths['/api/v1/workflows/']['get']['parameters']['query']>
    >({
      query: (params) => ({
        url: 'workflows/',
        params,
      }),
      providesTags: [{ type: 'Workflow', id: LIST_TAG }],
    }),
    listRecentWorkflows: build.query<
      paths['/api/v1/workflows/']['get']['responses']['200']['content']['application/json'],
      void
    >({
      query: () => ({
        url: 'workflows/',
        params: {
          page: 0,
          per_page: 10,
          order_by: 'opened_at',
          direction: 'DESC',
        },
      }),
      providesTags: [{ type: 'WorkflowsRecent', id: LIST_TAG }],
    }),
    listSystemWorkflows: build.query<
      paths['/api/v1/workflows/']['get']['responses']['200']['content']['application/json'],
      void
    >({
      query: () => ({
        url: 'workflows/',
        params: {
          page: 0,
          per_page: 10,
          order_by: 'opened_at',
          direction: 'DESC',
        },
      }),
      transformResponse: () => {
        return {
          page: 0,
          per_page: 10,
          items: [],
          total: 0,
          pages: 0,
        };
      },
      providesTags: [{ type: 'WorkflowsRecent', id: LIST_TAG }],
    }),
  }),
});

export const {
  useGetWorkflowQuery,
  useLazyGetWorkflowQuery,
  useCreateWorkflowMutation,
  useDeleteWorkflowMutation,
  useUpdateWorkflowMutation,
  useListWorkflowsQuery,
  useListRecentWorkflowsQuery,
  useListSystemWorkflowsQuery,
} = workflowsApi;
