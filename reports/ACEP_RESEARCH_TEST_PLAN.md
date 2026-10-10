# ACEP 4.0 Research Test Plan & Benchmark Protocols

## 1. Test Suite Objectives
This test plan defines the formal experimental verification protocol for validating that ACEP functions as an authentic, evidence-driven, adaptive control engineering platform under changing plant dynamics, sensor faults, actuator failures, and adversarial cyber injections.

---

## 2. Experimental Scenarios (Experiments A through T)

1. **Experiment A (Nominal Tracking)**: Unit step response tracking across 5 linear and nonlinear benchmark plants ($e_{ss} \le 0.01$).
2. **Experiment B (Step & Impulse Disturbance Rejection)**: High-amplitude torque disturbance ($d(t) = 3.5 \text{ Nm}$) injected at $t = 2.0\text{s}$.
3. **Experiment C (Time-Varying Plant Parameters)**: Plant mass increased by $+50\%$ and damping reduced by $-40\%$ at $t = 1.5\text{s}$. RLS estimator convergence monitored.
4. **Experiment D (Sudden Actuator Degradation)**: Actuator control effectiveness dropped from $100\%$ to $60\%$ (40% loss of control authority) at $t = 2.5\text{s}$.
5. **Experiment E (Sensor Bias & Drift)**: Linear sensor calibration drift ($+0.15\text{ units/sec}$) applied to output channel.
6. **Experiment F (Actuator Saturation Clamping)**: Hard physical saturation limits enforced at $u \in [-15, +15]$ Volts/Nm with anti-windup back-calculation.
7. **Experiment G (Unmodeled Aerodynamic Buffeting)**: High-frequency band-limited Dryden wind-shear turbulence injected into aerodynamic state.
8. **Experiment H (Network Delay & Packet Loss)**: Communication latency ($\tau = 40\text{ ms}$) and random $15\%$ packet dropouts.
9. **Experiment I (False Data Injection Attack)**: Spoofed sensor spike $+50\text{ units}$ injected over interval $t \in [3.0, 3.2]\text{s}$.
10. **Experiment J (Digital Twin Parameter Mismatch)**: Intentional $25\%$ parameter discrepancy in digital twin baseline model.
11. **Experiment K (Guarded Controller Reconfiguration)**: Dynamic transition between baseline PID and robust evolved controller under bumpless transfer.
12. **Experiment L (Combined Triple Hazard)**: Simultaneous actuator wear (40%), load gust, and cyber spoofing attack.
13. **Experiment M (Distributed Swarm Consensus)**: 10-agent UAV formation tracking under dynamic graph topology and single-agent loss.
14. **Experiment N (Uncertainty & Robustness Stress Test)**: Monte Carlo variations over plant poles $\pm 30\%$.
15. **Experiment O (Neural Compensator OOD Generalization)**: Evaluation of trained weights on unseen high-frequency multi-frequency inputs.
16. **Experiment P (Safe Fallback & Emergency Shutdown)**: Triggering Lyapunov-stable degraded mode when recovery criteria fail.
17. **Experiment Q (Repeated Monte Carlo Trials)**: 100 trials with fixed pseudo-random seeds (Seed 42 through 142).
18. **Experiment R (Computational Latency Benchmark)**: Execution time per control loop step on standard CPU (target $\le 5\text{ ms}$).
19. **Experiment S (Formal Verification Gate Test)**: Invariance checks under Control Barrier Functions ($h(x) \ge 0$) and Riccati solvability.
20. **Experiment T (End-to-End Autonomous Pipeline)**: Complete unassisted workflow: Audit $\to$ Design $\to$ Optimization $\to$ Simulation $\to$ Fault Detection $\to$ Twin Rehearsal $\to$ Reconfiguration $\to$ Explanation.

---

## 3. Metrics & Acceptance Criteria
- Tracking error: Root Mean Square Error ($RMSE$)
- Control effort: Integral of Squared Control ($ISC = \int u^2 dt$)
- Transient response: Peak Overshoot ($M_p < 15\%$), Settling time ($t_s \le 1.8\text{s}$)
- Stability guarantee: Minimum eigenvalue of Lyapunov decay $\lambda_{\min}(Q) > 0$
- Safety compliance: Zero barrier function violations ($h(x(t)) \ge 0 \quad \forall t$)
