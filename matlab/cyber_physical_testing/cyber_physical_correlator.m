function isCorrelated = cyber_physical_correlator(networkLoss, physicalResidual)
% CYBER_PHYSICAL_CORRELATOR Correlates network telemetry drops with physical state divergence
isCorrelated = (networkLoss > 0.10 && physicalResidual > 0.20);
end
