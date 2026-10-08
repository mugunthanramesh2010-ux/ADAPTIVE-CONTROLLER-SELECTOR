function model = multiagent_transformer()
% MULTIAGENT_TRANSFORMER Initializes Multi-Agent Attention Transformer Model Architecture
%
% Syntax:
%   model = multiagent_transformer()
%
% Outputs:
%   model - Struct containing transformer hyperparameters for multi-agent policy encoding

    model = struct();
    model.Dimension = 256;
    model.Heads = 8;
    model.Layers = 6;
    model.FeedforwardDim = 1024;
    model.Activation = 'GELU';
    model.Dropout = 0.1;
    model.Name = 'MultiAgent Transformer';

    disp(model);
end
