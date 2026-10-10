function [pkt_out, isLost] = packet_loss_simulator(pkt_in, pkt_prev, dropRate)
% PACKET_LOSS_SIMULATOR Random adversarial packet loss
isLost = (rand() < dropRate);
if isLost, pkt_out = pkt_prev; else, pkt_out = pkt_in; end
end
