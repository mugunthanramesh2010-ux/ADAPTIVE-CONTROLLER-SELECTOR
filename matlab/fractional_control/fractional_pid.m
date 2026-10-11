function u = fractional_pid(e, de, int_e, lambda, mu)
% FRACTIONAL_PID PI^lambda D^mu Controller
    % Standard benchmark: lambda=0.8, mu=0.6
    Kp = 4.0; Ki = 2.0; Kd = 1.2;
    u = Kp*e + Ki*(int_e^lambda) + Kd*(de^mu);
    disp(['Fractional PID Evaluated: lambda=', num2str(lambda), ', mu=', num2str(mu)]);
end
