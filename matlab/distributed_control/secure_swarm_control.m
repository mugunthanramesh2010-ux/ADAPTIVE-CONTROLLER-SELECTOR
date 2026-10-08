function action = secure_swarm_control(state, securityFlag)
% SECURE_SWARM_CONTROL Cyber-attack resilient swarm control with failsafe isolation
%
% Syntax:
%   action = secure_swarm_control(state, securityFlag)
%
% Inputs:
%   state        - Agent state vector
%   securityFlag - Binary flag: 1 if cyber threat/tampering detected, 0 if secure
%
% Outputs:
%   action       - Action signal (zeroed failsafe or stabilizing feedback)

    if securityFlag == 1
        action = zeros(size(state));
        disp('Threat Detected: Safe State Interlock Activated');
    else
        action = -state;
    end
end
