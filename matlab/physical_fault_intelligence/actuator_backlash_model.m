function pos_out = actuator_backlash_model(pos_in, prev_out, gap)
% ACTUATOR_BACKLASH_MODEL Mechanical gear backlash hysteresis
diff = pos_in - prev_out;
if abs(diff) <= gap/2
    pos_out = prev_out;
else
    pos_out = pos_in - sign(diff) * (gap/2);
end
end
