import sys
import os
import time
import random
import matplotlib
# Use 'TkAgg' or 'Qt5Agg' to bypass the PyCharm backend error
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt

# --- Your Global dictionaries ---
hospitals = {}
students = {}
hospital_pref = {}
student_pref = {}

# --- Your existing load_input, get_ranked, check_valid, and print_output ---
# (I am omitting the full text here for brevity, but they stay exactly as you provided)

def load_input(filename):
    # ... (Your existing code)
    global hospitals, students, hospital_pref, student_pref
    if not os.path.exists(filename) or os.stat(filename).st_size == 0:
        return False
    with open(filename, 'r') as f:
        content = f.read().splitlines()
        lines = [line.strip() for line in content if line.strip()]
    if not lines: return False
    n = int(lines[0])
    hospitals = {f"H{i}": "" for i in range(1, n + 1)}
    students = {f"S{i}": 0 for i in range(1, n + 1)}
    valid_range = set(range(1, n + 1))
    for i in range(1, n + 1):
        prefs = list(map(int, lines[i].split()))
        h_id = f"H{i}"
        hospital_pref[h_id] = {f"S{s_num}": rank + 1 for rank, s_num in enumerate(prefs)}
    for i in range(1, n + 1):
        prefs = list(map(int, lines[i + n].split()))
        s_id = f"S{i}"
        student_pref[s_id] = {f"H{h_num}": rank + 1 for rank, h_num in enumerate(prefs)}
    return True

def get_ranked():
    # ... (Your existing code)
    while True:
        finished = True
        for student, count in students.items():
            if students[student] == 0:
                for hospital, rank in student_pref[student].items():
                    a = hospital
                    if hospitals[a] == "":
                        hospitals[a] = student
                        students[student] = 1
                        break
                    elif hospital_pref[a][student] < hospital_pref[a][hospitals[a]]:
                        old_student = hospitals[a]
                        students[old_student] = 0
                        hospitals[a] = student
                        students[student] = 1
                        break
        for student, picked in students.items():
            finished = finished and (picked == 1)
        if finished: break

def check_valid():
    # ... (Your existing code)
    for hosp, current_student in hospitals.items():
        for alt_student, alt_hosp_pref_rank in hospital_pref[hosp].items():
            if alt_hosp_pref_rank < hospital_pref[hosp][current_student]:
                assigned_hosp = ""
                for h, s in hospitals.items():
                    if s == alt_student:
                        assigned_hosp = h
                if student_pref[alt_student][hosp] < student_pref[alt_student][assigned_hosp]:
                    return False
    return True

# --- NEW: Logic to generate the .in files and Plot ---

def generate_and_save_input(n, filename):
    """Generates valid random preferences and writes them to a .in file."""
    with open(filename, 'w') as f:
        f.write(f"{n}\n")
        nums = list(range(1, n + 1))
        # Hospital prefs
        for _ in range(n):
            prefs = random.sample(nums, n)
            f.write(" ".join(map(str, prefs)) + "\n")
        # Student prefs
        for _ in range(n):
            prefs = random.sample(nums, n)
            f.write(" ".join(map(str, prefs)) + "\n")

if __name__ == "__main__":
    n_values = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]
    match_times = []
    verify_times = []

    for n in n_values:
        filename = f"test_{n}.in"
        # 1. Create the .in file
        generate_and_save_input(n, filename)
        
        # 2. Reset and Load
        hospitals, students, hospital_pref, student_pref = {}, {}, {}, {}
        load_input(filename)
        
        # 3. Time get_ranked (solely)
        start_match = time.perf_counter()
        get_ranked()
        end_match = time.perf_counter()
        match_times.append(end_match - start_match)
        
        # 4. Time check_valid (solely)
        start_verify = time.perf_counter()
        check_valid()
        end_verify = time.perf_counter()
        verify_times.append(end_verify - start_verify)
        
        print(f"n={n} | Match: {match_times[-1]:.6f}s | Verify: {verify_times[-1]:.6f}s")

    # --- Plotting ---
    plt.figure(figsize=(10, 6))
    plt.plot(n_values, match_times, label='Matchmaking Time (get_ranked)', marker='o', linestyle='-')
    plt.plot(n_values, verify_times, label='Verifier Time (check_valid)', marker='s', linestyle='-')
    
    plt.title('Gale-Shapley Algorithm vs. Verifier Performance')
    plt.xlabel('Number of Entities (n)')
    plt.ylabel('Runtime (Seconds)')
    plt.xscale('linear') # Using log scale for n values
    plt.grid(True, which="both", ls="-", alpha=0.5)
    plt.legend()
    plt.show()