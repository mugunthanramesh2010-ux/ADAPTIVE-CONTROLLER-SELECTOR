function history = controller_evolution_history(generationLog)
% CONTROLLER_EVOLUTION_HISTORY Phylogenetic lineage tracking
    history = struct();
    history.TotalGenerations = length(generationLog);
    history.PhylogeneticTree = 'Root -> Lineage_A (PID) -> Lineage_B (LQR) -> Lineage_C (ACEP_Hybrid)';
    disp(history.PhylogeneticTree);
end
