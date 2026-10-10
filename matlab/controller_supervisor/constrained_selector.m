function selected = constrained_selector(candidates, maxEffort, maxOvershoot)
% CONSTRAINED_SELECTOR Filters candidates through hard safety and physical constraints
if nargin < 2, maxEffort = 20.0; end
if nargin < 3, maxOvershoot = 15.0; end

selected = [];
for i = 1:length(candidates)
    if candidates(i).effort <= maxEffort && candidates(i).overshoot <= maxOvershoot
        selected = [selected; candidates(i)];
    end
end
fprintf('Constrained Selector: %d of %d candidates meet physical safety constraints.\n', length(selected), length(candidates));
end
