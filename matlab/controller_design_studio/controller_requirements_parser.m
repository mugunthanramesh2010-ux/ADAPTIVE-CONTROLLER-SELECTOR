function specs = controller_requirements_parser(ts, Mp, ess)
% CONTROLLER_REQUIREMENTS_PARSER Translates time-domain specs into pole placement targets
if nargin < 1 || isempty(ts), ts = 1.5; end   % Settling time 2% band (s)
if nargin < 2 || isempty(Mp), Mp = 10.0; end  % Max overshoot (%)
if nargin < 3 || isempty(ess), ess = 0.01; end

zeta = sqrt((log(Mp/100)^2) / (pi^2 + log(Mp/100)^2));
wn = 4.0 / (zeta * ts);
dominantPoles = [-zeta*wn + 1i*wn*sqrt(1-zeta^2), -zeta*wn - 1i*wn*sqrt(1-zeta^2)];

specs = struct('SettlingTime', ts, 'Overshoot', Mp, 'SteadyStateError', ess, ...
               'Zeta', zeta, 'NaturalFrequency', wn, 'TargetDominantPoles', dominantPoles);
end
