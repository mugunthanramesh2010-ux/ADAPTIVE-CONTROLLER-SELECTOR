function generate_datasets(N)
%GENERATE_DATASETS Generates N synthetic controller datasets for NN training.
%   Each row contains: plant_num, plant_den, Kp, Ki, Kd, fitness

% Preallocate
plant_nums = zeros(N,1);
plant_dens = zeros(N,1);
Kp = zeros(N,1);
Ki = zeros(N,1);
Kd = zeros(N,1);
fitness = zeros(N,1);

for i = 1:N
    % Random plant (second‑order) coefficients
    numPlant = randi([5,15]);   % numerator coefficient range
    denPlant = randi([8,20]);   % denominator coefficient range
    plant_nums(i) = numPlant;
    plant_dens(i) = denPlant;
    % Random controller gains (reasonable bounds)
    Kp(i) = rand()*20;   % 0‑20
    Ki(i) = rand()*10;   % 0‑10
    Kd(i) = rand()*5;    % 0‑5
    % Simple fitness proxy – inverse of ITAE for unit‑step tracking
    dt = 0.01; t = 0:dt:2;
    A = [0,1; -denPlant, -numPlant];
    B = [0; 1];
    C = [1,0];
    x = [0;0];
    e_int = 0;
    itae = 0;
    for tk = t
        y = C*x;
        e = 1 - y; % unit‑step reference
        e_int = e_int + e*dt;
        u = Kp(i)*e + Ki(i)*e_int - Kd(i)*x(2);
        xdot = A*x + B*u;
        x = x + dt*xdot;
        itae = itae + tk*abs(e)*dt;
    end
    fitness(i) = 1/(itae + eps); % higher is better
end

tableData = table(plant_nums, plant_dens, Kp, Ki, Kd, fitness);
outputFile = fullfile('datasets','controller_data_12000.csv');
if ~exist('datasets','dir')
    mkdir('datasets');
end
writetable(tableData, outputFile);
fprintf('Generated %d synthetic rows -> %s\n', N, outputFile);
end
