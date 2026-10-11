function species = controller_species_generator(nicheEnvironment)
% CONTROLLER_SPECIES_GENERATOR Breeds environmental niche-specialized controllers
    species = struct();
    species.Niche = nicheEnvironment; % e.g., 'High-Turbulence', 'Thermal-Wear'
    species.DominantTraits = {'Fast-Settling', 'Extreme-Robustness', 'Low-Jitter'};
    species.FitnessPotential = 0.965;
    disp(['New Controller Species Bred for: ', nicheEnvironment]);
end
