function [pkt_out, queue] = communication_delay_attack(pkt_in, queue, delaySteps)
% COMMUNICATION_DELAY_ATTACK Malicious latency buffer injection
if isempty(queue), queue = repmat(pkt_in, 1, delaySteps); end
queue(end+1) = pkt_in;
pkt_out = queue(1);
queue(1) = [];
end
