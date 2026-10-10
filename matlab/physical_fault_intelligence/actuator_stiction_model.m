function F_fric = actuator_stiction_model(v, F_app, F_coulomb, F_static)
% ACTUATOR_STICTION_MODEL Karnopp/Tustin friction model with stick-slip transition
if abs(v) < 1e-4
    F_fric = max(-F_static, min(F_static, F_app));
else
    F_fric = (F_coulomb + (F_static - F_coulomb)*exp(-(v/0.05)^2)) * sign(v);
end
end
