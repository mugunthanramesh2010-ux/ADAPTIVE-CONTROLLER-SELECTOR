function plant = load_variation_model(plant, massMultiplier)
% LOAD_VARIATION_MODEL Dynamically rescales mass and inertia
plant.mass = plant.mass * massMultiplier;
plant.A(2,1) = -plant.stiffness / plant.mass;
plant.A(2,2) = -plant.damping / plant.mass;
plant.B(2)   = 10.0 / plant.mass;
end
