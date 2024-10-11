import torch

from invokeai.backend.flux.ip_adapter.xlabs_ip_adapter_flux import infer_xlabs_ip_adapter_params_from_state_dict
from tests.backend.flux.ip_adapter.xlabs_flux_ip_adapter_state_dict import xlabs_sd_shapes


def test_infer_xlabs_ip_adapter_params_from_state_dict():
    # Construct a dummy state_dict with tensors of the correct shape on the meta device.
    with torch.device("meta"):
        sd = {k: torch.zeros(v) for k, v in xlabs_sd_shapes.items()}

    params = infer_xlabs_ip_adapter_params_from_state_dict(sd)

    assert params.num_double_blocks == 19
    assert params.context_dim == 4096
    assert params.hidden_dim == 3072
    assert params.clip_embeddings_dim == 768
