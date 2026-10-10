function [t_stat, p_val] = statistical_comparison(vecA, vecB)
% STATISTICAL_COMPARISON Paired t-test between two controller outcomes
diffVec = vecA - vecB;
n = length(diffVec);
t_stat = mean(diffVec) / (std(diffVec) / sqrt(n));
p_val = 2 * (1 - normcdf(abs(t_stat)));
end
