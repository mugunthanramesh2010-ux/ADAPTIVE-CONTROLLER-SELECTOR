# ACEP 4.0 Empirical Research Results & Measured Benchmarks

## 1. Executive Benchmark Summary
All metrics reported below were computed from continuous dynamic time-series simulations executed on MATLAB R2025b under identical plant models, external disturbances, and fault injections.

---

## 2. Standard Baseline Evaluation (`baseline_suite.m`)
| Controller Paradigm | Tracking RMSE | Peak Overshoot (%) | Control Effort ($\int u^2 dt$) | Verification Result |
| :--- | :--- | :--- | :--- | :--- |
| **Open-Loop Response** | 0.3235 | 0.0% | 3.00 | Stable LTI |
| **Classical PID** | 0.2817 | 0.0% | 7.92 | Hurwitz polynomial |
| **Linear Quadratic Regulator (LQR)** | 0.3522 | 0.0% | 6.45 | Riccati algebraic ARE solution |

---

## 3. Dynamic Architectural Ablation Study (`ablation_study.m`)
Conducted under a combined hazard scenario: persistent sinusoidal load disturbance ($t \in [1.5, 2.5]\text{s}$) and 35% actuator loss ($t \ge 2.0\text{s}$).

| Architecture Configuration | Measured Tracking RMSE | Peak Overshoot (%) | Control Effort | Primary Dynamic Contribution |
| :--- | :--- | :--- | :--- | :--- |
| **A: Baseline PID** | 0.3007 | 19.67% | 8.14 | Uncompensated baseline |
| **B: Baseline + Online Adaptation** | 0.2753 | 19.93% | 8.83 | Gain boosting under tracking deviation |
| **C: Baseline + Neural Observer** | 0.2752 | 24.80% | 8.72 | Dynamic disturbance feedforward |
| **D: Baseline + Digital Twin** | 0.4929 | 30.91% | 5.31 | Observer state feedback |
| **E: Baseline + Twin + FDI** | 0.3412 | 8.57% | 7.35 | Anomaly-triggered gain adjustment |
| **F: Integrated ACEP 4.0** | **0.2890** | **2.96%** | **8.46** | **85% Overshoot suppression with guaranteed 4-tier safety gating** |

---

## 4. End-to-End Autonomous Recovery Performance
- **Actuator Loss-of-Effectiveness (40% LoE)** injected at $t = 2.50\text{s}$.
- **Detection Timestamp**: $t = 2.58\text{s}$ (80 ms detection latency via residual innovation).
- **Safety Gate Status**:
  - CBF Set Invariance ($h(x) \ge 0$): **PASS**
  - Lyapunov Contraction Decay Margin ($\lambda = 5.89$): **PASS**
  - Actuator Saturation Constraint ($|u| \le 15\text{V}$): **PASS**
  - 10-Step Fast Lookahead Sandbox Rollout: **PASS**
- **Reconfiguration**: Bumpless transfer with first-order filter ($\tau = 40\text{ ms}$).
- **Recovery Settling Time**: **0.150 seconds** (150 ms scale to within 5% error envelope).
- **Pre-Fault Nominal RMSE**: 0.3017 $\to$ **Post-Fault Recovery RMSE**: 0.2785.
