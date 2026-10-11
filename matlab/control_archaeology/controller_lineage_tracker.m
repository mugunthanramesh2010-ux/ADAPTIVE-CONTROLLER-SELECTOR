function lineage = controller_lineage_tracker(childId, parentId)
% CONTROLLER_LINEAGE_TRACKER Evaluates evolutionary divergence mechanisms
    lineage.Parent = parentId;
    lineage.Child = childId;
    lineage.MutationReason = 'Sensor bias drift required +25% integral boost';
    disp(lineage.MutationReason);
end
