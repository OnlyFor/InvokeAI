import type { RootState } from 'app/store/store';
import type { GraphType } from 'features/nodes/util/graph/generation/Graph';
import { Graph } from 'features/nodes/util/graph/generation/Graph';
import { getBoardField } from 'features/nodes/util/graph/graphBuilderUtils';

import { ESRGAN } from './constants';

type Arg = {
  image_name: string;
  state: RootState;
};

export const buildAdHocUpscaleGraph = ({ image_name, state }: Arg): GraphType => {
  const { esrganModelName } = state.postprocessing;

  const g = new Graph('adhoc-esrgan-graph');
  g.addNode({
    id: ESRGAN,
    type: 'esrgan',
    image: { image_name },
    model_name: esrganModelName,
    is_intermediate: false,
    board: getBoardField(state),
  });

  g.upsertMetadata({
    esrgan_model: esrganModelName,
  });

  return g.getGraph();
};
