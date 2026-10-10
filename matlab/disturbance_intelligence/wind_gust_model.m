function v_gust = wind_gust_model(t, t_start, T_gust, V_max)
% WIND_GUST_MODEL Standard 1-cosine Dryden aerodynamic gust model
if t >= t_start && t <= t_start + T_gust
    v_gust = (V_max / 2) * (1 - cos(2*pi*(t - t_start) / T_gust));
else
    v_gust = 0.0;
end
end
