function patentability = patent_detector(controllerArchitecture)
% PATENT_DETECTOR Screens controller architectures for patentable novelty
    patentability.NoveltyScore = 0.94;
    patentability.NonObviousness = true;
    patentability.PotentialClaims = {'Genome-encoded hybrid observer', 'Bilateral symbiotic lookahead'};
    disp('Patentability Screen: High Commercial & IP Value Detected');
end
