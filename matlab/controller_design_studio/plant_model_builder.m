function plant = plant_model_builder(m, c, k, b)
% PLANT_MODEL_BUILDER Builds state-space model for second-order mass-spring-damper / actuator
if nargin < 1 || isempty(m), m = 1.0; end
if nargin < 2 || isempty(c), c = 3.0; end
if nargin < 3 || isempty(k), k = 10.0; end
if nargin < 4 || isempty(b), b = 10.0; end

A = [0, 1; -k/m, -c/m];
B = [0; b/m];
C = [1, 0];
D = 0;

wn = sqrt(k/m);
zeta = c / (2 * sqrt(k*m));
plant = struct('A', A, 'B', B, 'C', C, 'D', D, 'mass', m, 'damping', c, 'stiffness', k, ...
               'wn', wn, 'zeta', zeta, 'poles', eig(A));
end
