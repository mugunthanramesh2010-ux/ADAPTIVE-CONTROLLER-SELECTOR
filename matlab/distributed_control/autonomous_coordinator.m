function command = autonomous_coordinator(health, faults, attacks)
% AUTONOMOUS_COORDINATOR High-level supervisor selecting tactical operating regime
%
% Syntax:
%   command = autonomous_coordinator(health, faults, attacks)
%
% Inputs:
%   health  - Scalar percentage of system health [0, 100]
%   faults  - Vector of detected physical faults
%   attacks - Vector of detected cyber intrusion indicators
%
% Outputs:
%   command - High-level directive for swarm/plant reconfiguration

    if sum(attacks) > 0
        command = 'Activate Cyber Defense';
    elseif sum(faults) > 2
        command = 'Reconfigure Swarm';
    elseif health < 50
        command = 'Self-Healing Mode';
    else
        command = 'Normal Operation';
    end

    disp(['Autonomous Coordinator Directive: ', command]);
end
