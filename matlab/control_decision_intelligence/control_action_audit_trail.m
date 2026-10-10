function trail = control_action_audit_trail(trail, actionRecord)
% CONTROL_ACTION_AUDIT_TRAIL Immutable append-only audit trail
if isempty(trail), trail = {}; end
trail{end+1} = actionRecord;
end
