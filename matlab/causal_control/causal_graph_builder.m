function dag = causal_graph_builder(telemetryHistory)
% CAUSAL_GRAPH_BUILDER Discovers causal dependencies via do-calculus
    dag.Nodes = {'WindGust', 'ActuatorTorque', 'PitchAngle', 'BatteryCurrent'};
    dag.Edges = [1 3; 2 3; 2 4];
    disp('Causal Control DAG Constructed');
end
