function candidates = controller_candidate_generator(plant)
% CONTROLLER_CANDIDATE_GENERATOR Generates candidate suite for given plant
if nargin < 1 || isempty(plant)
    plant = struct('A', [0 1; -10 -3], 'B', [0; 10], 'C', [1 0]);
end
wn = sqrt(abs(plant.A(2,1)));
c1 = struct('Name', 'Classical_PID', 'Gains', [4.5, 1.2, 0.8]);
c2 = struct('Name', 'Linear_Quadratic_Regulator', 'Gains', [3.82, 1.45]);
c3 = struct('Name', 'Robust_Sliding_Mode', 'Gains', [5.0, 1.5]);
c4 = struct('Name', 'Active_Disturbance_Rejection', 'Gains', [4.0, 1.0, 20.0]);
candidates = {c1, c2, c3, c4};
end
