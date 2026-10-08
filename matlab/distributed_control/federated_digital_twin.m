function twin = federated_digital_twin(localTwins)
% FEDERATED_DIGITAL_TWIN Aggregates local digital twin models across distributed nodes
%
% Syntax:
%   twin = federated_digital_twin(localTwins)
%
% Inputs:
%   localTwins - Cell array of local plant parameter matrices or state representations
%
% Outputs:
%   twin       - Globally aggregated federated digital twin model

    n = length(localTwins);
    if n == 0
        error('localTwins cell array must not be empty');
    end

    twin = zeros(size(localTwins{1}));
    for i = 1:n
        twin = twin + localTwins{i};
    end
    twin = twin / n;

    disp('Federated Twin Updated');
end
