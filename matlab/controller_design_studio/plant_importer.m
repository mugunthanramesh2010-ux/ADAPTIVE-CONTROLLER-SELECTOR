function sys = plant_importer(type, params)
% PLANT_IMPORTER Imports SISO/MIMO plant models from transfer functions or state space
if nargin < 1 || isempty(type), type = 'SS'; end
if nargin < 2 || isempty(params)
    params = struct('A', [0 1; -10 -3], 'B', [0; 10], 'C', [1 0], 'D', 0);
end

sys = struct();
sys.Type = upper(type);
switch upper(type)
    case 'SS'
        sys.A = params.A; sys.B = params.B; sys.C = params.C; sys.D = params.D;
        sys.Order = size(params.A, 1);
        sys.Poles = eig(params.A);
    case 'TF'
        sys.Num = params.num; sys.Den = params.den;
        sys.Order = length(params.den) - 1;
        sys.Poles = roots(params.den);
        sys.Zeros = roots(params.num);
end
sys.IsStable = all(real(sys.Poles) < 0);
fprintf('[PLANT IMPORTER] Imported %s plant of order %d (Stable: %d)\n', sys.Type, sys.Order, sys.IsStable);
end
