import numpy as np 
import random

def gen_data(start, num_points, interval_length, 
             baseline=22.0, noise_std=0.5, 
             anomaly_prob=0.01, anomaly_magnitude=5.0, 
             max_anomaly_duration=5, alpha=0.9):
    # Create an array of datetime64 values using np.arange.
    times = np.arange(np.datetime64(start), 
                      np.datetime64(start) + np.timedelta64(num_points * interval_length, 'm'),
                      np.timedelta64(interval_length, 'm'))
    # Creates empty array for the sensor values
    sensor_data = np.empty(num_points)
    
    # AR(1) process.
    sensor_data[0] = baseline + np.random.normal(0, noise_std)
    for i in range(1, num_points):
        sensor_data[i] = alpha * sensor_data[i-1] + (1 - alpha) * baseline + np.random.normal(0, noise_std)
    
    # Inject anomalies.
    i = 0
    while i < num_points:
        if np.random.random() < anomaly_prob:
            # Randomly choose an anomaly type.
            anomaly_type = random.choice(['sudden', 'faulty', 'gradual'])
            # Choose a random duration for the anomaly (at least 1 point).
            duration = np.random.randint(1, max_anomaly_duration + 1)
            end_index = min(i + duration, num_points)
            
            if anomaly_type == 'sudden':
                # Sudden spike or drop: add or subtract anomaly_magnitude for the duration.
                delta = anomaly_magnitude if random.random() < 0.5 else -anomaly_magnitude
                sensor_data[i:end_index] += delta
            elif anomaly_type == 'faulty':
                # Faulty sensor: simulate a sensor failure by setting the value to 0.
                sensor_data[i:end_index] = 0
            elif anomaly_type == 'gradual':
                # Gradual change: interpolate from the current value to a target offset value.
                current_val = sensor_data[i]
                target = current_val + (anomaly_magnitude if random.random() < 0.5 else -anomaly_magnitude)
                sensor_data[i:end_index] = np.linspace(current_val, target, end_index - i)
            # Skip ahead to avoid overlapping anomalies.
            i = end_index
        else:
            i += 1
            
    return times, sensor_data


if __name__ == '__main__':
    times,data = gen_data(np.datetime64('now'),336,30,25,1.5,0.02,10,10,0.4)

    np.savetxt("data.csv",np.array([times, data]), delimiter = ",",fmt = "%s")
    
