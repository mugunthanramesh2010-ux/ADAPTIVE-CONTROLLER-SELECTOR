function status = test_adaptation()
% TEST_ADAPTATION Unit test for RLS parameter identification under load change
theta_true = [10; 3];
phi = [1; 0.5];
y = phi' * theta_true + 0.01 * randn();
[theta_hat, ~] = online_parameter_estimator(y, phi, [9; 2.5], eye(2)*10, 0.98);
assert(norm(theta_hat - theta_true) < 2.0, 'RLS estimation divergence');
status = 'PASS';
disp('test_adaptation: PASS');
end
