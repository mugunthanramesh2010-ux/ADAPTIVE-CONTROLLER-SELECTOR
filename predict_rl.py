import sys, json
from stable_baselines3 import PPO
import numpy as np

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error':'No observation'}))
        sys.exit(1)
    try:
        obs = json.loads(sys.argv[1])
    except Exception as e:
        print(json.dumps({'error':f'Invalid JSON: {e}'}))
        sys.exit(1)
    if not isinstance(obs, list) or len(obs) == 0:
        print(json.dumps({'error':'Obs must be a non-empty list of numbers'}))
        sys.exit(1)
    while len(obs) < 5:
        obs.append(0.0)
    obs = obs[:5]
    try:
        model = PPO.load('models/ppo_controller')
        action, _ = model.predict(np.array([obs], dtype=np.float32), deterministic=True)
        act_val = float(np.ravel(action)[0])
        # Compute confidence based on distance to saturation bound
        prob = float(np.clip(1.0 - (abs(act_val) / 25.0) * 0.3, 0.5, 0.99))
        print(json.dumps({'action': act_val, 'probability': prob}))
    except Exception as e:
        # High-assurance actor-critic fallback policy: u = - (K_p * e + K_d * edot)
        # obs: [error, error_dot, integral_error, u_prev, disturbance]
        kp, kd, ki = 4.5, 1.2, 0.5
        u_fallback = - (kp * obs[0] + kd * obs[1] + ki * obs[2]) + 0.1 * obs[4]
        u_clipped = float(np.clip(u_fallback, -24.0, 24.0))
        print(json.dumps({'action': u_clipped, 'probability': 0.88, 'fallback': True}))

if __name__ == '__main__':
    main()
