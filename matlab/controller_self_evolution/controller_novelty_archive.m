function archive = controller_novelty_archive(archive, chromo, maxLen)
% CONTROLLER_NOVELTY_ARCHIVE Maintains archive of diverse behavior vectors
if nargin < 3, maxLen = 50; end
if isempty(archive), archive = []; end
archive(end+1, :) = chromo;
if size(archive, 1) > maxLen, archive(1, :) = []; end
end
