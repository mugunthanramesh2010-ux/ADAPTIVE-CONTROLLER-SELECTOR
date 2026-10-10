function compensator = automatic_lead_lag_synthesis(plant, targetPM)
% AUTOMATIC_LEAD_LAG_SYNTHESIS Shapes phase margin via lead compensator zero-pole placement
if nargin < 2 || isempty(targetPM), targetPM = 50.0; end % degrees
wn = sqrt(abs(plant.A(2,1)));
phi_m_rad = targetPM * pi / 180;
alpha = (1 - sin(phi_m_rad)) / (1 + sin(phi_m_rad));
z = wn * sqrt(alpha);
p = z / alpha;
Kc = 2.5 / sqrt(alpha);

compensator = struct('Zero', z, 'Pole', p, 'Gain', Kc, 'TargetPM', targetPM);
end
