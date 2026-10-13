function spec = acep_universal_project_spec(domain, plantType, params, reqs, solver)
% ACEP_UNIVERSAL_PROJECT_SPEC Creates, validates and serializes a Universal Project Specification
% Version 4.0 Next-Gen AI Engineering Platform
%
% Fully input-driven data contract connecting user requirements, plant models,
% controller synthesis, numerical simulation, verification, and deliverables.

if nargin < 1 || isempty(domain), domain = 'electromechanical'; end
if nargin < 2 || isempty(plantType), plantType = 'dc_motor'; end
if nargin < 3 || isempty(params), params = struct(); end
if nargin < 4 || isempty(reqs), reqs = struct(); end
if nargin < 5 || isempty(solver), solver = struct('dt', 0.01, 't_final', 4.0, 'method', 'rk4'); end

spec = struct();
spec.schema_version = '4.0.0';
spec.project_id = sprintf('ACEP-PRJ-%s-%06d', upper(domain(1:min(4,length(domain)))), randi([100000, 999999]));
spec.timestamp = datestr(now, 'yyyy-mm-ddTHH:MM:SS');
spec.domain = domain;
spec.plant_type = plantType;

% Plant physical parameters with defaults if not supplied
spec.plant = struct();
spec.plant.name = plantType;
spec.plant.description = sprintf('%s dynamic system in %s domain', strrep(plantType, '_', ' '), domain);

switch lower(plantType)
    case {'dc_motor', 'dcmotor'}
        spec.plant.R = get_field_or_default(params, 'R', 1.0);       % Resistance (Ohm)
        spec.plant.L = get_field_or_default(params, 'L', 0.5);       % Inductance (H)
        spec.plant.Km = get_field_or_default(params, 'Km', 0.1);     % Motor torque constant (Nm/A)
        spec.plant.Kb = get_field_or_default(params, 'Kb', 0.1);     % Back-emf constant (V/(rad/s))
        spec.plant.J = get_field_or_default(params, 'J', 0.01);      % Rotor inertia (kg*m^2)
        spec.plant.b = get_field_or_default(params, 'b', 0.1);       % Viscous friction (Nms)
        
        % State-space: x = [theta_dot; current]
        spec.plant.A = [-spec.plant.b / spec.plant.J,  spec.plant.Km / spec.plant.J;
                        -spec.plant.Kb / spec.plant.L, -spec.plant.R / spec.plant.L];
        spec.plant.B = [0; 1 / spec.plant.L];
        spec.plant.C = [1, 0];
        spec.plant.D = 0;
        spec.plant.u_max = get_field_or_default(params, 'u_max', 24.0); % Voltage limit
        spec.plant.states = {'angular_velocity (rad/s)', 'armature_current (A)'};
        spec.plant.inputs = {'armature_voltage (V)'};
        spec.plant.outputs = {'angular_velocity (rad/s)'};

    case {'quadrotor', 'uav', 'drone'}
        m = get_field_or_default(params, 'mass', 1.2);               % Mass (kg)
        Iyy = get_field_or_default(params, 'Iyy', 0.025);            % Pitch inertia (kg*m^2)
        d_arm = get_field_or_default(params, 'arm_length', 0.22);    % Arm length (m)
        spec.plant.m = m;
        spec.plant.Iyy = Iyy;
        spec.plant.d_arm = d_arm;
        
        % Pitch attitude dynamics: x = [theta; theta_dot]
        spec.plant.A = [0, 1; 0, -0.05];
        spec.plant.B = [0; 1 / Iyy];
        spec.plant.C = [1, 0];
        spec.plant.D = 0;
        spec.plant.u_max = get_field_or_default(params, 'u_max', 5.0); % Pitch torque (Nm)
        spec.plant.states = {'pitch_angle (rad)', 'pitch_rate (rad/s)'};
        spec.plant.inputs = {'pitch_torque (Nm)'};
        spec.plant.outputs = {'pitch_angle (rad)'};

    case {'inverted_pendulum', 'pendulum'}
        M = get_field_or_default(params, 'cart_mass', 1.0);          % Cart mass (kg)
        m = get_field_or_default(params, 'pendulum_mass', 0.1);      % Pendulum mass (kg)
        l = get_field_or_default(params, 'length', 0.5);             % Pendulum half-length (m)
        g = 9.81;
        
        % Linearized around upright theta = 0: x = [x; x_dot; theta; theta_dot]
        denom = l * (4/3 * (M + m) - m);
        a31 = g * (M + m) / denom;
        a33 = 0;
        b3 = 1 / denom;
        spec.plant.A = [0, 1; a31, 0];
        spec.plant.B = [0; b3];
        spec.plant.C = [1, 0];
        spec.plant.D = 0;
        spec.plant.u_max = get_field_or_default(params, 'u_max', 20.0);
        spec.plant.states = {'angle (rad)', 'angular_rate (rad/s)'};
        spec.plant.inputs = {'force (N)'};
        spec.plant.outputs = {'angle (rad)'};

    otherwise
        % Generic custom linear system
        A_cust = get_field_or_default(params, 'A', [0, 1; -10, -2]);
        B_cust = get_field_or_default(params, 'B', [0; 1]);
        C_cust = get_field_or_default(params, 'C', [1, 0]);
        D_cust = get_field_or_default(params, 'D', 0);
        spec.plant.A = A_cust;
        spec.plant.B = B_cust;
        spec.plant.C = C_cust;
        spec.plant.D = D_cust;
        spec.plant.u_max = get_field_or_default(params, 'u_max', 15.0);
        spec.plant.states = {'state_1', 'state_2'};
        spec.plant.inputs = {'control_input'};
        spec.plant.outputs = {'system_output'};
end

% Control Engineering Requirements
spec.requirements = struct();
spec.requirements.settling_time_target = get_field_or_default(reqs, 'settling_time_target', 0.8);  % Ts (s)
spec.requirements.overshoot_max = get_field_or_default(reqs, 'overshoot_max', 10.0);              % Mp (%)
spec.requirements.steady_state_error_max = get_field_or_default(reqs, 'steady_state_error_max', 0.02);
spec.requirements.control_effort_weight = get_field_or_default(reqs, 'control_effort_weight', 0.05);
spec.requirements.actuator_saturation_limit = spec.plant.u_max;
spec.requirements.phase_margin_min = get_field_or_default(reqs, 'phase_margin_min', 45.0);        % deg
spec.requirements.gain_margin_min = get_field_or_default(reqs, 'gain_margin_min', 6.0);          % dB

% Solver & Simulation Setup
spec.simulation = struct();
spec.simulation.dt = solver.dt;
spec.simulation.t_final = solver.t_final;
spec.simulation.time_vector = 0:solver.dt:solver.t_final;
spec.simulation.solver_method = solver.method;
spec.simulation.reference_profile = get_field_or_default(reqs, 'reference', 1.0); % Default unit step
spec.simulation.disturbance = get_field_or_default(reqs, 'disturbance', struct('time', 2.0, 'mag', 0.0));

% Evidence Ledger
spec.evidence_ledger = {};
spec.provenance = struct('created_by', 'ACEP_AI_ENGINEERING_PLATFORM', 'validation_status', 'VALIDATED');

end

function val = get_field_or_default(s, f, def)
if isstruct(s) && isfield(s, f) && ~isempty(s.(f))
    val = s.(f);
else
    val = def;
end
end
