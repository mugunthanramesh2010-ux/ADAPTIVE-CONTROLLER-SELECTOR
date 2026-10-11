function value = controller_market_value(energySavingsKWh, downtimePreventedHours)
% CONTROLLER_MARKET_VALUE Computes monetary value created by controller
    valEnergy = energySavingsKWh * 0.14;
    valDowntime = downtimePreventedHours * 2500;
    value.TotalEconomicValue = valEnergy + valDowntime;
    disp(['Controller Economic ROI: $', num2str(value.TotalEconomicValue)]);
end
