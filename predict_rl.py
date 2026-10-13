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
    if not isinstance(obs, list) or len(obs) != 5:
        print(json.dumps({'error':'Obs must be list of 5 numbers'}))
        sys.exit(1)
    model = PPO.load('models/ppo_controller')
    action, _ = model.predict(np.array([obs]), deterministic=True)
    print(json.dumps({'action': float(action[0]), 'probability': None}))

if __name__ == '__main__':
    main()
