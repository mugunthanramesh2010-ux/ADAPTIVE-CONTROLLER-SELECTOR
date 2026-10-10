function x_twin_next = digital_twin_runtime(A, x_twin, B, u, dt)
% DIGITAL_TWIN_RUNTIME Continuous state integration of the digital twin
dx = A * x_twin + B * u;
x_twin_next = x_twin + dt * dx;
end
