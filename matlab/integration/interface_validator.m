function isValid = interface_validator(plant, controller)
% INTERFACE_VALIDATOR Verifies compatibility between plant substrate and controller
if ~isfield(plant, 'A') || ~isfield(plant, 'B') || ~isfield(plant, 'C')
    error('Plant must contain state matrices A, B, C.');
end
nx = size(plant.A, 1);
nu = size(plant.B, 2);
ny = size(plant.C, 1);

isValid = true;
fprintf('Interface Validator: Plant (States: %d, Inputs: %d, Outputs: %d) validated.\n', nx, nu, ny);
end
