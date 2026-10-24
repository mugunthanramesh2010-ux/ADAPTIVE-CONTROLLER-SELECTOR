/**
 * ============================================================================
 * CONTROL-ARENA X — COMPREHENSIVE ENGINEERING COMPONENT LIBRARY REGISTRY
 * ============================================================================
 * Extensible, typed component registry across all engineering domains:
 * - Sensors (Encoders, IMUs, Tachometers, Pressure, Thermocouples, Current)
 * - Actuators & Motors (DC Servos, BLDC, Steppers, Solenoids, Valves)
 * - Microcontrollers & Compute (STM32, ESP32, ATmega328P, Raspberry Pi, TI DSP)
 * - Power Electronics (H-Bridges, Buck Converters, Inverters, Regulators)
 * - Control & Signal Conditioning Blocks (Anti-Aliasing Filters, Observers)
 * - Mechanical & Mechatronic Blocks (Gearboxes, Ball Screws, Linkages)
 */

'use strict';

const COMPONENT_CATEGORIES = {
  SENSORS: 'sensors',
  ACTUATORS_MOTORS: 'actuators_motors',
  COMPUTE_CONTROLLERS: 'compute_controllers',
  POWER_ELECTRONICS: 'power_electronics',
  SIGNAL_PROCESSING: 'signal_processing',
  MECHANICAL: 'mechanical'
};

const COMPONENT_LIBRARY = [
  // ── SENSORS ─────────────────────────────────────────────────────────────
  {
    id: 'sens_optical_encoder_1024',
    category: COMPONENT_CATEGORIES.SENSORS,
    name: '1024-PPR Quadrature Incremental Optical Encoder',
    partNumber: 'ENC-OPT-1024-ABZ',
    manufacturer: 'Broadcom / Avago',
    domain: 'electromechanical',
    description: 'High-resolution dual-channel quadrature rotary encoder with index pulse for motor angle and speed feedback.',
    inputs: [
      { name: 'shaft_rotation', type: 'mechanical_rotary', units: 'rad', range: [-1e6, 1e6] }
    ],
    outputs: [
      { name: 'channel_a', type: 'digital_pulse', units: 'TTL_5V', pinType: 'GPIO_INTERRUPT' },
      { name: 'channel_b', type: 'digital_pulse', units: 'TTL_5V', pinType: 'GPIO_INTERRUPT' },
      { name: 'index_z', type: 'digital_pulse', units: 'TTL_5V', pinType: 'GPIO' }
    ],
    parameters: {
      pulsesPerRev: 1024,
      supplyVoltage: 5.0,
      maxRpm: 12000,
      quantizationError_rad: (2 * Math.PI) / (1024 * 4)
    },
    costEstUsd: 28.50,
    transferFunction: 'K_enc = 4096 / (2*pi) pulses/rad'
  },
  {
    id: 'sens_imu_mpu6050',
    category: COMPONENT_CATEGORIES.SENSORS,
    name: '6-DOF MEMS Inertial Measurement Unit (IMU)',
    partNumber: 'MPU-6050-QFN24',
    manufacturer: 'TDK InvenSense',
    domain: 'aerospace_robotics',
    description: 'Triple-axis gyroscope and triple-axis accelerometer with on-board Digital Motion Processor (DMP).',
    inputs: [
      { name: 'attitude_acceleration', type: 'physical_acceleration', units: 'm/s^2', range: [-160, 160] },
      { name: 'angular_velocity', type: 'physical_angular_velocity', units: 'rad/s', range: [-35, 35] }
    ],
    outputs: [
      { name: 'i2c_bus', type: 'digital_bus', units: 'I2C_400KHz', pinType: 'I2C_SDA_SCL' },
      { name: 'int_pin', type: 'digital_pulse', units: 'TTL_3V3', pinType: 'GPIO_EXTI' }
    ],
    parameters: {
      gyroSensitivity_lsb_per_deg_s: 131.0,
      accelSensitivity_lsb_per_g: 16384,
      supplyVoltage: 3.3,
      sampleRateHz: 1000
    },
    costEstUsd: 4.80,
    transferFunction: 'H_imu(s) = 1 / (1 + s*tau_imu), tau = 2ms'
  },
  {
    id: 'sens_current_acs712',
    category: COMPONENT_CATEGORIES.SENSORS,
    name: 'Hall-Effect Linear Current Sensor (±20A)',
    partNumber: 'ACS712ELCTR-20A-T',
    manufacturer: 'Allegro MicroSystems',
    domain: 'power_electronics',
    description: 'Galvanically isolated Hall-effect sensor with analog output proportional to motor armature current.',
    inputs: [
      { name: 'conducted_current', type: 'electrical_current', units: 'A', range: [-20.0, 20.0] }
    ],
    outputs: [
      { name: 'analog_voltage', type: 'analog_signal', units: 'V', pinType: 'ADC_IN', range: [0.0, 5.0] }
    ],
    parameters: {
      sensitivity_mv_per_a: 100.0,
      zeroCurrentVoltage: 2.5,
      bandwidth_khz: 80.0
    },
    costEstUsd: 3.20,
    transferFunction: 'V_out = 2.5 + 0.100 * I_in'
  },
  {
    id: 'sens_temp_pt100',
    category: COMPONENT_CATEGORIES.SENSORS,
    name: 'Precision Platinum RTD Temperature Sensor (PT100)',
    partNumber: 'RTD-PT100-CLASS-A',
    manufacturer: 'Omega Engineering',
    domain: 'process_thermal',
    description: 'Class A 4-wire RTD probe with MAX31865 SPI amplifier for high-accuracy thermal control.',
    inputs: [
      { name: 'process_temperature', type: 'thermal_temp', units: 'degC', range: [-50, 450] }
    ],
    outputs: [
      { name: 'spi_bus', type: 'digital_bus', units: 'SPI_2MHz', pinType: 'SPI_MOSI_MISO_SCK_CS' }
    ],
    parameters: {
      nominalResistance_ohms: 100.0,
      temperatureCoefficient: 0.00385,
      accuracyDegC: 0.15
    },
    costEstUsd: 18.00,
    transferFunction: 'R(T) = 100 * (1 + 0.00385 * T)'
  },

  // ── ACTUATORS & MOTORS ──────────────────────────────────────────────────
  {
    id: 'act_dc_motor_24v',
    category: COMPONENT_CATEGORIES.ACTUATORS_MOTORS,
    name: 'Industrial High-Torque 24V Brushed DC Motor',
    partNumber: 'MTR-DC-24V-80W',
    manufacturer: 'Maxon / Faulhaber Equivalent',
    domain: 'electromechanical',
    description: 'Low-inertia high-efficiency DC servomotor with graphite brushes, ideal for closed-loop motion control.',
    inputs: [
      { name: 'armature_voltage', type: 'electrical_voltage', units: 'V', range: [-24.0, 24.0], pinType: 'H_BRIDGE_OUT' }
    ],
    outputs: [
      { name: 'shaft_torque', type: 'mechanical_torque', units: 'N_m', range: [-1.5, 1.5] },
      { name: 'shaft_velocity', type: 'mechanical_velocity', units: 'rad/s', range: [-350, 350] }
    ],
    parameters: {
      nominalVoltage: 24.0,
      stallTorque_Nm: 1.85,
      ratedTorque_Nm: 0.42,
      noLoadSpeedRpm: 3800,
      rotorInertia_kgm2: 0.00012,
      resistance_ohms: 1.45,
      inductance_mH: 0.85,
      torqueConstant_Nm_A: 0.062,
      backEmfConstant_V_rad_s: 0.062
    },
    costEstUsd: 65.00,
    transferFunction: 'G_m(s) = K_t / ((R + s*L)*(J*s + b) + K_t*K_e)'
  },
  {
    id: 'act_bldc_drone_motor',
    category: COMPONENT_CATEGORIES.ACTUATORS_MOTORS,
    name: 'Brushless DC Outrunner Motor 2306 (2400KV)',
    partNumber: 'BLDC-2306-2400KV',
    manufacturer: 'T-Motor / Emax',
    domain: 'aerospace_robotics',
    description: 'High-thrust outrunner BLDC motor for multirotor UAVs and high-speed robotic drives.',
    inputs: [
      { name: 'esc_3phase_pwm', type: 'electrical_pwm', units: 'DShot_PWM', pinType: 'ESC_IN' }
    ],
    outputs: [
      { name: 'aerodynamic_thrust', type: 'physical_force', units: 'N', range: [0, 16.5] }
    ],
    parameters: {
      kvRating: 2400,
      cellConfig: '4S_LiPo_16V8',
      maxThrust_g: 1680,
      propellerSize_inch: 5.0
    },
    costEstUsd: 19.50,
    transferFunction: 'Thrust(u) = C_t * (KV * V * u)^2'
  },
  {
    id: 'act_stepper_nema17',
    category: COMPONENT_CATEGORIES.ACTUATORS_MOTORS,
    name: 'NEMA-17 High-Torque Bipolar Stepper Motor',
    partNumber: '17HS19-2004S1',
    manufacturer: 'StepperOnline',
    domain: 'industrial_automation',
    description: '1.8 degree 200-step hybrid bipolar stepper motor for 3D printers, CNC axes, and automated conveyors.',
    inputs: [
      { name: 'step_pulse', type: 'digital_pulse', units: 'TTL_5V', pinType: 'STEP_PIN' },
      { name: 'direction', type: 'digital_level', units: 'TTL_5V', pinType: 'DIR_PIN' }
    ],
    outputs: [
      { name: 'angular_step', type: 'discrete_position', units: 'deg', stepSize: 1.8 }
    ],
    parameters: {
      stepAngleDeg: 1.8,
      holdingTorque_Nm: 0.59,
      ratedCurrent_A: 2.0,
      phaseResistance_ohms: 1.4
    },
    costEstUsd: 14.20,
    transferFunction: 'Discrete step angle theta[k] = theta[k-1] + delta * sign(dir)'
  },
  {
    id: 'act_proportional_valve',
    category: COMPONENT_CATEGORIES.ACTUATORS_MOTORS,
    name: 'Solenoid Proportional Flow Control Valve (24V)',
    partNumber: 'PV-FLOW-24V-08',
    manufacturer: 'Festo / SMC Equivalent',
    domain: 'process_thermal',
    description: 'PWM-driven proportional hydraulic/pneumatic throttle valve for fluid flow regulation.',
    inputs: [
      { name: 'pwm_duty_cycle', type: 'electrical_pwm', units: 'pct', range: [0, 100], pinType: 'POWER_MOSFET_PWM' }
    ],
    outputs: [
      { name: 'fluid_flow_rate', type: 'volumetric_flow', units: 'L_min', range: [0, 25.0] }
    ],
    parameters: {
      nominalPressure_bar: 6.0,
      maxFlow_l_min: 25.0,
      responseTime_ms: 15.0
    },
    costEstUsd: 110.00,
    transferFunction: 'Q(s) = (Q_max / 100) / (1 + 0.015*s) * PWM(s)'
  },

  // ── COMPUTE & EMBEDDED CONTROLLERS ──────────────────────────────────────
  {
    id: 'mcu_stm32f401re',
    category: COMPONENT_CATEGORIES.COMPUTE_CONTROLLERS,
    name: 'STM32F401RE ARM Cortex-M4 Microcontroller (Nucleo-64)',
    partNumber: 'NUCLEO-F401RE',
    manufacturer: 'STMicroelectronics',
    domain: 'embedded_control',
    description: '84MHz 32-bit ARM Cortex-M4 with hardware FPU, 512KB Flash, 96KB SRAM, high-speed PWM timers, and 12-bit ADCs.',
    inputs: [
      { name: 'power_supply', type: 'power', units: 'V', range: [5.0, 12.0] },
      { name: 'adc_channels', type: 'analog_signal', count: 16, range: [0, 3.3] },
      { name: 'digital_inputs', type: 'digital_signal', count: 50, range: [0, 3.3] }
    ],
    outputs: [
      { name: 'pwm_outputs', type: 'pwm_signal', count: 8, freqMaxKhz: 100 },
      { name: 'usart_tx', type: 'serial_comm', count: 3, baudMax: 921600 },
      { name: 'spi_master', type: 'spi_comm', count: 3 },
      { name: 'i2c_master', type: 'i2c_comm', count: 3 }
    ],
    parameters: {
      cpuClockMhz: 84,
      flashKb: 512,
      sramKb: 96,
      fpuSupported: true,
      compilerToolchain: 'arm-none-eabi-gcc',
      supportedLanguages: ['C', 'C++', 'MicroPython']
    },
    costEstUsd: 15.50,
    codeTemplate: 'stm32_hal_main.c'
  },
  {
    id: 'mcu_esp32_wroom',
    category: COMPONENT_CATEGORIES.COMPUTE_CONTROLLERS,
    name: 'ESP32-WROOM-32D Dual-Core Wi-Fi/BLE MCU',
    partNumber: 'ESP32-WROOM-32D-N4',
    manufacturer: 'Espressif Systems',
    domain: 'iot_automation',
    description: '240MHz dual-core Xtensa 32-bit LX6 with 520KB SRAM, Wi-Fi 802.11 b/g/n, Bluetooth 4.2 BR/EDR and BLE.',
    inputs: [
      { name: 'power_supply', type: 'power', units: 'V', range: [3.3, 5.0] },
      { name: 'adc_channels', type: 'analog_signal', count: 18, range: [0, 3.3] }
    ],
    outputs: [
      { name: 'mcpwm_motor_pwm', type: 'pwm_signal', count: 6 },
      { name: 'dac_channels', type: 'analog_output', count: 2, range: [0, 3.3] }
    ],
    parameters: {
      cpuClockMhz: 240,
      cores: 2,
      sramKb: 520,
      wirelessSupported: true,
      compilerToolchain: 'xtensa-esp32-elf-gcc / PlatformIO',
      supportedLanguages: ['C', 'C++', 'MicroPython', 'Arduino']
    },
    costEstUsd: 4.50,
    codeTemplate: 'esp32_freertos_main.c'
  },
  {
    id: 'mcu_arduino_uno_r3',
    category: COMPONENT_CATEGORIES.COMPUTE_CONTROLLERS,
    name: 'Arduino Uno R3 (ATmega328P 8-Bit AVR)',
    partNumber: 'A000066',
    manufacturer: 'Arduino LLC',
    domain: 'educational_mechatronics',
    description: '16MHz 8-bit AVR RISC microcontroller with 32KB Flash, 2KB SRAM, 6 PWM outputs, and 6 10-bit analog inputs.',
    inputs: [
      { name: 'analog_in_a0_a5', type: 'analog_signal', count: 6, range: [0, 5.0] }
    ],
    outputs: [
      { name: 'pwm_pins_3_5_6_9_10_11', type: 'pwm_signal', count: 6, freqHz: 490 }
    ],
    parameters: {
      cpuClockMhz: 16,
      flashKb: 32,
      sramKb: 2,
      compilerToolchain: 'avr-gcc / Arduino CLI',
      supportedLanguages: ['C', 'C++ / Arduino']
    },
    costEstUsd: 22.00,
    codeTemplate: 'arduino_uno_main.ino'
  },
  {
    id: 'mcu_raspberry_pi_4',
    category: COMPONENT_CATEGORIES.COMPUTE_CONTROLLERS,
    name: 'Raspberry Pi 4 Model B (Quad-Core ARM Cortex-A72)',
    partNumber: 'RPI4-MODBP-4GB',
    manufacturer: 'Raspberry Pi Foundation',
    domain: 'embedded_linux_robotics',
    description: '1.5GHz 64-bit quad-core ARM Cortex-A72 with 4GB LPDDR4, Gigabit Ethernet, 40-pin GPIO, running Real-Time Linux (PREEMPT_RT).',
    inputs: [
      { name: 'gpio_header', type: 'digital_signal', count: 28, range: [0, 3.3] }
    ],
    outputs: [
      { name: 'hardware_pwm', type: 'pwm_signal', count: 2 },
      { name: 'can_bus', type: 'differential_bus', count: 1 }
    ],
    parameters: {
      cpuClockGhz: 1.5,
      ramGb: 4,
      osEnvironment: 'Linux 6.6 with PREEMPT_RT',
      supportedLanguages: ['Python', 'C', 'C++', 'Rust', 'ROS2']
    },
    costEstUsd: 55.00,
    codeTemplate: 'linux_rt_main.py'
  },

  // ── POWER ELECTRONICS ───────────────────────────────────────────────────
  {
    id: 'pwr_h_bridge_l298n',
    category: COMPONENT_CATEGORIES.POWER_ELECTRONICS,
    name: 'Dual H-Bridge Motor Driver Module (L298N)',
    partNumber: 'MOD-L298N-DUAL',
    manufacturer: 'STMicroelectronics / Generic Module',
    domain: 'electromechanical',
    description: 'Dual high-current bipolar H-bridge for driving inductive loads such as relays, solenoids, DC and stepper motors up to 2A per channel.',
    inputs: [
      { name: 'logic_in1', type: 'digital_level', pinType: 'MCU_GPIO' },
      { name: 'logic_in2', type: 'digital_level', pinType: 'MCU_GPIO' },
      { name: 'enable_pwm', type: 'pwm_signal', pinType: 'MCU_PWM' },
      { name: 'v_motor_power', type: 'power', units: 'V', range: [7.0, 35.0] }
    ],
    outputs: [
      { name: 'motor_out_a', type: 'power_drive', units: 'V', range: [-35.0, 35.0], maxCurrentA: 2.0 }
    ],
    parameters: {
      peakCurrent_A: 3.0,
      continuousCurrent_A: 2.0,
      logicVoltage: 5.0,
      dropVoltage_V: 2.0
    },
    costEstUsd: 3.50,
    transferFunction: 'V_out = sgn(IN1 - IN2) * (V_power - 2.0) * (DutyCycle / 100)'
  },
  {
    id: 'pwr_buck_converter_lm2596',
    category: COMPONENT_CATEGORIES.POWER_ELECTRONICS,
    name: 'Step-Down DC-DC Buck Switching Regulator (3A)',
    partNumber: 'MOD-LM2596S-ADJ',
    manufacturer: 'Texas Instruments',
    domain: 'power_electronics',
    description: 'High-efficiency 150kHz fixed-frequency step-down switching regulator supplying 5V/3.3V logic rails from 24V bus.',
    inputs: [
      { name: 'vin_unregulated', type: 'power', units: 'V', range: [7.0, 40.0] }
    ],
    outputs: [
      { name: 'vout_regulated', type: 'power', units: 'V', range: [1.25, 35.0], maxCurrentA: 3.0 }
    ],
    parameters: {
      switchingFreqKhz: 150,
      efficiencyPct: 92.0,
      outputRipple_mV: 30.0
    },
    costEstUsd: 2.20
  },

  // ── SIGNAL PROCESSING & OBSERVER BLOCKS ─────────────────────────────────
  {
    id: 'sig_kalman_filter_state_estimator',
    category: COMPONENT_CATEGORIES.SIGNAL_PROCESSING,
    name: 'Discrete Linear Kalman Filter State Estimator',
    partNumber: 'ALG-LKF-OBSERVER-V2',
    domain: 'estimation_safety',
    description: 'Optimal recursive state estimator computing x_hat[k|k] from noisy sensor measurements and control input command.',
    inputs: [
      { name: 'measurement_y', type: 'vector_float', units: 'sensor_units' },
      { name: 'command_u', type: 'vector_float', units: 'control_units' }
    ],
    outputs: [
      { name: 'estimated_state_x_hat', type: 'vector_float' },
      { name: 'innovation_residual_r', type: 'vector_float' },
      { name: 'covariance_p', type: 'matrix_float' }
    ],
    parameters: {
      processNoiseCovariance_Q: 0.001,
      measurementNoiseCovariance_R: 0.05
    },
    costEstUsd: 0.0,
    transferFunction: 'x_hat[k|k] = x_hat[k|k-1] + K_k * (y[k] - C * x_hat[k|k-1])'
  },
  {
    id: 'sens_current_ina219',
    category: COMPONENT_CATEGORIES.SENSORS,
    name: 'INA219 High-Side DC Current & Power Sensor',
    partNumber: 'INA219-SOT23',
    manufacturer: 'Texas Instruments',
    domain: 'electromechanical',
    description: 'Bi-directional current and bus voltage monitor over I2C with 0.1 ohm shunt resistor.',
    inputs: [{ name: 'bus_current', type: 'electrical_current', units: 'A', range: [-3.2, 3.2] }],
    outputs: [{ name: 'i2c_bus', type: 'digital_bus', units: 'I2C' }],
    parameters: { maxVoltage_V: 26.0, resolution_mA: 0.8 },
    costEstUsd: 4.50
  },
  {
    id: 'sens_thermocouple_max6675',
    category: COMPONENT_CATEGORIES.SENSORS,
    name: 'K-Type Thermocouple with Cold-Junction Compensator',
    partNumber: 'MAX6675-SOIC8',
    manufacturer: 'Analog Devices / Maxim',
    domain: 'process_thermal',
    description: '12-bit resolution thermocouple-to-digital converter with SPI read-only interface.',
    inputs: [{ name: 'temperature_c', type: 'thermal_temperature', units: 'degC', range: [0, 1024] }],
    outputs: [{ name: 'spi_bus', type: 'digital_bus', units: 'SPI' }],
    parameters: { resolution_degC: 0.25 },
    costEstUsd: 8.20
  },
  {
    id: 'sens_ultrasonic_hcsr04',
    category: COMPONENT_CATEGORIES.SENSORS,
    name: 'HC-SR04 Ultrasonic Distance Sensor',
    partNumber: 'HC-SR04-V2',
    manufacturer: 'Cytron / SparkFun',
    domain: 'robotics_motion',
    description: 'Non-contact ultrasonic distance measuring module (2cm to 400cm range).',
    inputs: [{ name: 'distance_m', type: 'spatial_distance', units: 'm', range: [0.02, 4.0] }],
    outputs: [{ name: 'echo_pulse', type: 'digital_pulse', units: 'us' }],
    parameters: { beamAngleDeg: 15.0 },
    costEstUsd: 3.25
  },
  {
    id: 'sens_linear_pot_10k',
    category: COMPONENT_CATEGORIES.SENSORS,
    name: '10k Ohm Precision Linear Potentiometer Displacement Sensor',
    partNumber: 'POT-LIN-10K-100MM',
    manufacturer: 'Bourns',
    domain: 'electromechanical',
    description: 'Conductive plastic linear slide potentiometer for position feedback.',
    inputs: [{ name: 'displacement_mm', type: 'mechanical_linear', units: 'mm', range: [0, 100] }],
    outputs: [{ name: 'voltage_out', type: 'analog_voltage', units: 'V' }],
    parameters: { resistanceOhm: 10000, linearityPct: 0.5 },
    costEstUsd: 14.50
  },
  {
    id: 'act_stepper_driver_a4988',
    category: COMPONENT_CATEGORIES.ACTUATORS_MOTORS,
    name: 'A4988 Microstepping DMOS Stepper Motor Driver',
    partNumber: 'A4988SETTR-T',
    manufacturer: 'Allegro MicroSystems',
    domain: 'cnc_mechatronics',
    description: 'Translator and overcurrent protection driver with 1/16 microstepping capability.',
    inputs: [{ name: 'step_pulse', type: 'digital_pulse' }, { name: 'dir_level', type: 'digital_logic' }],
    outputs: [{ name: 'coil_drive', type: 'bipolar_stepper', units: 'V', range: [8, 35] }],
    parameters: { maxCurrentA: 2.0, microstepModes: [1, 2, 4, 8, 16] },
    costEstUsd: 3.80
  },
  {
    id: 'act_servo_sg90',
    category: COMPONENT_CATEGORIES.ACTUATORS_MOTORS,
    name: 'TowerPro SG90 9g Micro Servo Motor',
    partNumber: 'SG90-9G-SERVO',
    manufacturer: 'TowerPro',
    domain: 'robotics_motion',
    description: 'Lightweight geared analog RC servo motor with built-in internal closed-loop driver.',
    inputs: [{ name: 'pwm_signal', type: 'pwm_50hz', units: 'ms_pulse', range: [1.0, 2.0] }],
    outputs: [{ name: 'shaft_angle', type: 'mechanical_rotary', units: 'deg', range: [0, 180] }],
    parameters: { stallTorqueKgCm: 1.8, operatingSpeedSec60: 0.1 },
    costEstUsd: 4.20
  },
  {
    id: 'act_solenoid_valve_12v',
    category: COMPONENT_CATEGORIES.ACTUATORS_MOTORS,
    name: '12V DC Normally-Closed Direct-Acting Solenoid Valve',
    partNumber: 'VALVE-SOL-12V-NC',
    manufacturer: 'Parker Hannifin',
    domain: 'process_thermal',
    description: 'Fluidic shut-off valve for liquid and gas flow control in process automation.',
    inputs: [{ name: 'drive_voltage', type: 'analog_voltage', units: 'V', range: [0, 12] }],
    outputs: [{ name: 'fluid_flow', type: 'flow_rate', units: 'L/min' }],
    parameters: { responseTimeMs: 20, maxPressureBar: 8.0 },
    costEstUsd: 19.50
  },
  {
    id: 'mcu_rpi_pico_rp2040',
    category: COMPONENT_CATEGORIES.COMPUTE_CONTROLLERS,
    name: 'Raspberry Pi Pico (Dual ARM Cortex-M0+ 133 MHz)',
    partNumber: 'RPI-PICO-RP2040',
    manufacturer: 'Raspberry Pi Foundation',
    domain: 'embedded_control',
    description: 'High-performance microcontroller with 26 multi-function GPIO and 8 programmable I/O (PIO) state machines.',
    inputs: [{ name: 'vsys', type: 'dc_power', units: 'V', range: [1.8, 5.5] }],
    outputs: [{ name: 'gpio_pins', type: 'digital_gpio', units: 'TTL_3V3' }],
    parameters: { coreCount: 2, clockSpeedMhz: 133, flashMemoryKb: 2048, sramKb: 264 },
    costEstUsd: 4.00
  },
  {
    id: 'mcu_teensy_41',
    category: COMPONENT_CATEGORIES.COMPUTE_CONTROLLERS,
    name: 'Teensy 4.1 Development Board (ARM Cortex-M7 600 MHz)',
    partNumber: 'TEENSY-41-IMXRT1062',
    manufacturer: 'PJRC',
    domain: 'embedded_control',
    description: 'Ultra-fast realtime microcontroller board with 600 MHz Cortex-M7, hardware floating point, and 55 I/O pins.',
    inputs: [{ name: 'vin', type: 'dc_power', units: 'V', range: [3.6, 5.5] }],
    outputs: [{ name: 'gpio_pins', type: 'digital_gpio', units: 'TTL_3V3' }],
    parameters: { clockSpeedMhz: 600, sramKb: 1024, flashMemoryKb: 8192 },
    costEstUsd: 33.00
  },
  {
    id: 'pwr_l298n_dual_hbridge',
    category: COMPONENT_CATEGORIES.POWER_ELECTRONICS,
    name: 'L298N Dual Full-Bridge High-Current Driver',
    partNumber: 'L298N-MULTIWATT15',
    manufacturer: 'STMicroelectronics',
    domain: 'electromechanical',
    description: 'High-voltage, high-current dual full-bridge driver designed to accept standard TTL logic levels.',
    inputs: [{ name: 'in1_in2', type: 'digital_logic' }, { name: 'enable_pwm', type: 'pwm_signal' }],
    outputs: [{ name: 'out1_out2', type: 'motor_power', units: 'V', range: [4.5, 46] }],
    parameters: { maxOutputCurrentA: 2.0, saturationVoltageV: 1.8 },
    costEstUsd: 5.40
  },
  {
    id: 'sig_butterworth_filter_4th',
    category: COMPONENT_CATEGORIES.SIGNAL_PROCESSING,
    name: '4th-Order Active Butterworth Low-Pass Filter',
    partNumber: 'FLT-BUTTER-4TH-100HZ',
    domain: 'signal_processing',
    description: 'Maximally flat magnitude anti-aliasing filter with 100 Hz cutoff frequency.',
    inputs: [{ name: 'raw_signal', type: 'analog_voltage', units: 'V' }],
    outputs: [{ name: 'filtered_signal', type: 'analog_voltage', units: 'V' }],
    parameters: { cutoffFreqHz: 100, rollOffDbPerDec: 80 },
    costEstUsd: 1.80,
    transferFunction: 'H(s) = 1 / ((s^2 + 0.7654s + 1)*(s^2 + 1.8478s + 1))'
  },
  {
    id: 'mech_ball_screw_linear',
    category: COMPONENT_CATEGORIES.MECHANICAL,
    name: 'Precision C7 Ball Screw Linear Transmission Mechanism',
    partNumber: 'BS-SFU1605-300MM',
    manufacturer: 'THK / Hiwin',
    domain: 'cnc_mechatronics',
    description: 'Low-friction recirculating ball screw assembly converting rotary torque to linear thrust.',
    inputs: [{ name: 'motor_torque', type: 'mechanical_rotary', units: 'N*m' }],
    outputs: [{ name: 'carriage_position', type: 'mechanical_linear', units: 'm' }],
    parameters: { leadPitchMm: 5.0, efficiencyPct: 90.0, backlashMm: 0.02 },
    costEstUsd: 48.00,
    transferFunction: 'x(t) = (pitch / 2*pi) * theta(t)'
  }
];

function listComponents(category = null) {
  if (!category || category === 'ALL') return COMPONENT_LIBRARY;
  return COMPONENT_LIBRARY.filter(c => c.category === category || c.domain === category);
}

function getComponent(id) {
  return COMPONENT_LIBRARY.find(c => c.id === id) || null;
}

function searchComponents(query) {
  if (!query) return COMPONENT_LIBRARY;
  const q = query.toLowerCase();
  return COMPONENT_LIBRARY.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.partNumber.toLowerCase().includes(q) ||
    c.domain.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
}

module.exports = {
  COMPONENT_CATEGORIES,
  COMPONENT_LIBRARY,
  listComponents,
  getComponent,
  searchComponents
};
