function dna = controller_dna_encoder(controllerStruct)
% CONTROLLER_DNA_ENCODER Encodes controller parameters into genetic DNA sequences
    dna = struct();
    dna.Header = 'ACEP-GENOME-V2';
    dna.Kp_Gene = sprintf('ATGC%04X', round(abs(controllerStruct.Kp)*100));
    dna.Ki_Gene = sprintf('CGTA%04X', round(abs(controllerStruct.Ki)*100));
    dna.Kd_Gene = sprintf('TACG%04X', round(abs(controllerStruct.Kd)*100));
    dna.Sequence = [dna.Header, dna.Kp_Gene, dna.Ki_Gene, dna.Kd_Gene];
    disp(['Controller Encoded to DNA: ', dna.Sequence]);
end
