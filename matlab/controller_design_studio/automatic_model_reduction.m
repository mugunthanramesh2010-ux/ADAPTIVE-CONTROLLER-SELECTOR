function redSys = automatic_model_reduction(A, B, C, targetOrder)
% AUTOMATIC_MODEL_REDUCTION Balanced truncation / dominant pole reduction
if nargin < 4 || isempty(targetOrder), targetOrder = min(2, size(A,1)); end
n = size(A, 1);
if n <= targetOrder
    redSys = struct('A', A, 'B', B, 'C', C, 'ReducedOrder', n);
    return;
end

% Retain dominant eigenmodes
[V, D] = eig(A);
[~, sortIdx] = sort(abs(real(diag(D))), 'ascend');
V_dom = V(:, sortIdx(1:targetOrder));
A_red = real(V_dom \ A * V_dom);
B_red = real(V_dom \ B);
C_red = real(C * V_dom);

redSys = struct('A', A_red, 'B', B_red, 'C', C_red, 'ReducedOrder', targetOrder);
end
