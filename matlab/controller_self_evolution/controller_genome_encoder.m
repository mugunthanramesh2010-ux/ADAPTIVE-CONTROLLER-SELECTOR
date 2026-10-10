function chromo = controller_genome_encoder(Kp, Ki, Kd, Q_w, smc)
% CONTROLLER_GENOME_ENCODER Normalizes gains into unit hypercube chromosome
chromo = [Kp/20.0, Ki/5.0, Kd/5.0, Q_w/50.0, smc/10.0];
chromo = max(0.0, min(1.0, chromo));
end
