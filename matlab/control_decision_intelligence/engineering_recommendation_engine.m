function rec = engineering_recommendation_engine(healthIndex, temp)
% ENGINEERING_RECOMMENDATION_ENGINE Generates maintenance recommendations
if healthIndex < 0.50 || temp > 80.0
    rec = 'SCHEDULE_IMMEDIATE_ACTUATOR_INSPECTION';
else
    rec = 'ROUTINE_MONITORING_SUFFICIENT';
end
end
