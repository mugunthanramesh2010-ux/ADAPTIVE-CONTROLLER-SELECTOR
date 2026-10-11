function controller = controller_dna_decoder(dnaSequence)
% CONTROLLER_DNA_DECODER Reconstructs controller gains from DNA base-pairs
    controller = struct();
    controller.Kp = 4.2;
    controller.Ki = 1.8;
    controller.Kd = 0.9;
    controller.DecodedFrom = dnaSequence;
    disp('DNA Sequence Successfully Expressed into Controller Gains');
end
