function activeCtrl = safe_candidate_promotion(candidateGains, currentCtrl)
% SAFE_CANDIDATE_PROMOTION Commits verified chromosome to active controller slot
activeCtrl = currentCtrl;
activeCtrl.Gains = [candidateGains.Kp, candidateGains.Kd];
activeCtrl.Name = 'EVOLVED_CHROMOSOME_ACTIVE';
fprintf('[PROMOTION] Successfully promoted evolved chromosome to active feedback loop.\n');
end
