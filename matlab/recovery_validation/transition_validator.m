function isSmooth = transition_validator(u_history)
% TRANSITION_VALIDATOR Checks actuator derivative limits (du/dt) during switching
du = diff(u_history);
maxRate = max(abs(du)) / 0.01;
isSmooth = (maxRate < 250.0);
end
