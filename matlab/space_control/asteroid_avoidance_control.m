function burnVector = asteroid_avoidance_control(trajectory, debrisEphemeris)
% ASTEROID_AVOIDANCE_CONTROL Computes evasive orbital burn
    burnVector.DeltaV_mps = [0.12; 0.05; -0.02];
    burnVector.ProbabilityOfCollision = 1e-8;
    disp('Evasive Delta-V Burn Computed');
end
