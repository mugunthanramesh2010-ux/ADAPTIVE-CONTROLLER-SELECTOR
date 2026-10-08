function cause = distributed_root_cause_analysis(faults, attacks)
% DISTRIBUTED_ROOT_CAUSE_ANALYSIS Disambiguates cyber-attacks from physical hardware faults
%
% Syntax:
%   cause = distributed_root_cause_analysis(faults, attacks)
%
% Inputs:
%   faults  - Vector of physical fault indicator residuals
%   attacks - Vector of cyber-attack detection flags (FDI, replay, spoofing)
%
% Outputs:
%   cause   - String diagnosis explaining root cause

    if sum(attacks) > 0
        cause = 'Cyber Attack';
    elseif sum(faults) > 0
        cause = 'Agent Failure';
    else
        cause = 'No Issue';
    end

    disp(['Root Cause Diagnosis: ', cause]);
end
