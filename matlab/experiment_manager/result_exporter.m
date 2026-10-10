function result_exporter(data, filename)
% RESULT_EXPORTER Exports benchmark results to CSV
if nargin < 2, filename = 'acep_experiment_results.csv'; end
writetable(struct2table(data), filename);
fprintf('Exported results to: %s\n', filename);
end
