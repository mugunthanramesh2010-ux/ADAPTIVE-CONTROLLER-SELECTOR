function gains = controller_genome_decoder(chromo)
% CONTROLLER_GENOME_DECODER Decodes unit hypercube chromosome into physical controller gains
gains = struct('Kp', chromo(1)*20.0, 'Ki', chromo(2)*5.0, 'Kd', chromo(3)*5.0, ...
               'Q_weight', chromo(4)*50.0, 'smc_gain', chromo(5)*10.0);
end
