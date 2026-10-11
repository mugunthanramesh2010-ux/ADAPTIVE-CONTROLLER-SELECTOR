function repairedWeights = neuron_repair(weights)
% NEURON_REPAIR Auto-regenerates degenerate neurons
    deadNeurons = find(abs(weights) < 1e-6);
    repairedWeights = weights;
    repairedWeights(deadNeurons) = 0.05 * randn(size(deadNeurons));
    disp(['Neuron Repair: ', num2str(length(deadNeurons)), ' dormant neurons regenerated.']);
end
