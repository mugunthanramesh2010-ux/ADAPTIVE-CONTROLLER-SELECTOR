function status = test_verification_gate()
% TEST_VERIFICATION_GATE Unit test for Lyapunov certification of closed loop
A_cl = [0 1; -15 -4];
[isStable, ~] = acep_formal_verifier(A_cl);
assert(isStable == true, 'Verification gate false negative');
status = 'PASS';
disp('test_verification_gate: PASS');
end
