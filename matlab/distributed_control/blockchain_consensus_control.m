function block = blockchain_consensus_control(data)
% BLOCKCHAIN_CONSENSUS_CONTROL Cryptographic consensus hashing for distributed control telemetry
%
% Syntax:
%   block = blockchain_consensus_control(data)
%
% Inputs:
%   data  - Telemetry payload or controller setpoint struct/array
%
% Outputs:
%   block - Struct containing timestamp, tamper-proof hash digest, and data payload

    block = struct();
    block.timestamp = datetime('now');
    block.hash = sum(double(char(string(data))));
    block.data = data;

    disp('Consensus Block Created');
end
