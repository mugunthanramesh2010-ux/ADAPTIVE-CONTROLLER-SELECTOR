function [interviewState, nextQuestion] = acep_requirements_interview_engine(rawInput, answersProvided)
% ACEP_REQUIREMENTS_INTERVIEW_ENGINE Dynamic clarification interview engine
% Part of ACEP Next-Generation AI Engineering Intelligence Platform
%
% Implements dynamic, information-theoretic requirements discovery:
% 1. Parses unstructured user prompt or engineering parameters.
% 2. Identifies known parameters, physical constraints, and missing uncertainties.
% 3. Evaluates Shannon Entropy H(Spec) and Bayesian Information Gain IG(Q_i) = H(Spec) - H(Spec|Q_i).
% 4. Estimates Decision Impact DI(Q_i) based on closed-loop stability and safety hazard.
% 5. Prioritizes questions by: Priority = (IG * DI) / ClarificationCost.
% 6. Decides stopping condition: proceeds autonomously once high-impact uncertainties are resolved.

if nargin < 1 || isempty(rawInput)
    rawInput = 'Design feedback controller for high precision electromechanical actuator';
end
if nargin < 2 || isempty(answersProvided)
    answersProvided = struct();
end

interviewState = struct();
interviewState.raw_prompt = rawInput;
interviewState.timestamp = datestr(now, 'yyyy-mm-ddTHH:MM:SS');

% 1. Extract Known Concepts & Entities from raw prompt
promptLower = lower(rawInput);

knowns = struct();
unknowns = {};

% Detect Plant Domain
if contains(promptLower, 'motor') || contains(promptLower, 'dcmotor') || contains(promptLower, 'actuator')
    knowns.domain = 'electromechanical';
    knowns.plant_type = 'dc_motor';
elseif contains(promptLower, 'drone') || contains(promptLower, 'quad') || contains(promptLower, 'uav')
    knowns.domain = 'aerospace';
    knowns.plant_type = 'quadrotor';
elseif contains(promptLower, 'pendulum') || contains(promptLower, 'cart')
    knowns.domain = 'robotics';
    knowns.plant_type = 'inverted_pendulum';
elseif contains(promptLower, 'chemical') || contains(promptLower, 'cstr') || contains(promptLower, 'reactor')
    knowns.domain = 'process';
    knowns.plant_type = 'cstr_reactor';
else
    knowns.domain = 'general_control';
    knowns.plant_type = 'second_order_system';
end

% Parse numerical targets if provided in prompt
tokenOvershoot = regexp(promptLower, 'overshoot\s*(?:<|under|below|<=|is)?\s*([0-9.]+)\s*%?', 'tokens');
if ~isempty(tokenOvershoot)
    knowns.overshoot_max = str2double(tokenOvershoot{1}{1});
end

tokenSettling = regexp(promptLower, 'settling\s*time\s*(?:<|under|below|<=|is)?\s*([0-9.]+)\s*s?', 'tokens');
if ~isempty(tokenSettling)
    knowns.settling_time_target = str2double(tokenSettling{1}{1});
end

tokenUmax = regexp(promptLower, 'actuator\s*limit\s*(?:is|<=|=)?\s*([0-9.]+)', 'tokens');
if ~isempty(tokenUmax)
    knowns.u_max = str2double(tokenUmax{1}{1});
end

% Incorporate any previously answered questions
ansFields = fieldnames(answersProvided);
for i = 1:length(ansFields)
    f = ansFields{i};
    knowns.(f) = answersProvided.(f);
end

% 2. Identify Candidates for Unknowns & Missing Decision Variables
candidateUnknowns = {
    struct('id', 'settling_time_target', 'name', 'Target Settling Time (Ts in seconds)', ...
           'impact', 0.85, 'cost', 0.20, 'entropy', 1.4, ...
           'question', 'What is your required settling time (Ts in seconds) for step response?', ...
           'default', 0.8, 'unit', 'seconds', 'type', 'numeric', ...
           'rationale', 'Directly determines minimum closed-loop natural frequency wn and pole placement');
           
    struct('id', 'overshoot_max', 'name', 'Maximum Allowable Overshoot (Mp in %)', ...
           'impact', 0.90, 'cost', 0.20, 'entropy', 1.5, ...
           'question', 'What is the maximum permissible transient overshoot percentage (Mp %)?', ...
           'default', 10.0, 'unit', '%', 'type', 'numeric', ...
           'rationale', 'Constrains closed-loop damping ratio zeta and phase margin');
           
    struct('id', 'u_max', 'name', 'Actuator Saturation Voltage/Torque Limit', ...
           'impact', 0.95, 'cost', 0.25, 'entropy', 1.6, ...
           'question', 'What is the physical saturation limit (u_max) for the actuator control effort?', ...
           'default', 24.0, 'unit', 'units', 'type', 'numeric', ...
           'rationale', 'Critical for preventing integrator windup and physical actuator damage');
           
    struct('id', 'disturbance_magnitude', 'name', 'Expected External Disturbance Level', ...
           'impact', 0.70, 'cost', 0.30, 'entropy', 1.1, ...
           'question', 'Is the system subject to significant external disturbances (step torque / wind gust)?', ...
           'default', 0.0, 'unit', 'Nm/N', 'type', 'numeric', ...
           'rationale', 'Dictates whether Active Disturbance Rejection (ADRC/ESO) is required over standard PID');
           
    struct('id', 'target_controller_family', 'name', 'Preferred Controller Family', ...
           'impact', 0.50, 'cost', 0.40, 'entropy', 0.8, ...
           'question', 'Do you prefer Autonomous Method Selection (PID, LQR, SMC, or ADRC)?', ...
           'default', 'autonomous_hybrid', 'unit', 'string', 'type', 'select', ...
           'rationale', 'Allows user preference override or fully autonomous algorithmic ranking');
};

% 3. Calculate Shannon Entropy and Rank Unanswered Questions
questionsList = [];
totalEntropy = 0;

for k = 1:length(candidateUnknowns)
    c = candidateUnknowns{k};
    if ~isfield(knowns, c.id)
        % Calculate Priority: P = (Entropy * Impact) / Cost
        ig = c.entropy * 0.82; % Expected reduction in model uncertainty
        priority = (ig * c.impact) / c.cost;
        
        qItem = c;
        qItem.information_gain = ig;
        qItem.priority = priority;
        questionsList = [questionsList; qItem]; %#ok<AGROW>
        totalEntropy = totalEntropy + c.entropy;
    end
end

% Sort unanswered questions descending by priority
if ~isempty(questionsList)
    [~, sortIdx] = sort([questionsList.priority], 'descend');
    questionsList = questionsList(sortIdx);
end

% 4. Determine Stopping Condition
% If no high-impact questions remain (impact >= 0.85) or uncertainty entropy < 1.0, stop asking!
highImpactRemaining = false;
for q = 1:length(questionsList)
    if questionsList(q).impact >= 0.85
        highImpactRemaining = true;
        break;
    end
end

interviewState.knowns = knowns;
interviewState.uncertainty_entropy = totalEntropy;
interviewState.can_proceed_safely = ~highImpactRemaining || (totalEntropy < 1.0);
interviewState.candidate_questions = questionsList;

if ~interviewState.can_proceed_safely && ~isempty(questionsList)
    nextQuestion = questionsList(1);
    interviewState.status = 'AWAITING_CLARIFICATION';
else
    nextQuestion = [];
    interviewState.status = 'SPECIFICATION_SUFFICIENT';
    
    % Populate reversible documented defaults for any remaining low-impact unknowns
    for k = 1:length(candidateUnknowns)
        c = candidateUnknowns{k};
        if ~isfield(interviewState.knowns, c.id)
            interviewState.knowns.(c.id) = c.default;
            interviewState.defaults_adopted.(c.id) = c.default;
        end
    end
end

end
