function audit = plant_order_analyzer(A, B, C)
% PLANT_ORDER_ANALYZER Computes system McMillan degree, controllability, and observability
n = size(A, 1);
Ct = B;
for i = 1:(n-1)
    Ct = [Ct, (A^i)*B];
end
Ob = C;
for i = 1:(n-1)
    Ob = [Ob; C*(A^i)];
end
rankCt = rank(Ct);
rankOb = rank(Ob);

audit = struct('Order', n, 'ControllabilityRank', rankCt, 'IsControllable', (rankCt == n), ...
               'ObservabilityRank', rankOb, 'IsObservable', (rankOb == n), ...
               'ConditionNumber', cond(A));
end
