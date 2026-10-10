function u_eff = actuator_gain_loss_model(u_cmd, healthRatio)
% ACTUATOR_GAIN_LOSS_MODEL Actuator loss of effectiveness (LoE)
healthRatio = max(0.0, min(1.0, healthRatio));
u_eff = u_cmd * healthRatio;
end
