function fitness = multiobjective_controller_fitness(chromo, plant)
% MULTIOBJECTIVE_CONTROLLER_FITNESS Evaluates closed-loop tracking, effort, and overshoot
g = controller_genome_decoder(chromo);
dt = 0.01; t = 0:dt:1.5; N = length(t);
x = [0; 0]; y_sim = zeros(1, N); u_sim = zeros(1, N);
for k = 1:N
    e = 1.0 - plant.C * x;
    u = max(-15, min(15, g.Kp*e - g.Kd*x(2)));
    x = x + dt * (plant.A * x + plant.B * u);
    y_sim(k) = plant.C * x; u_sim(k) = u;
end
rmse = sqrt(mean((1.0 - y_sim).^2));
effort = trapz(t, u_sim.^2);
fitness = 0.6 * rmse + 0.05 * effort;
end
