import sys
import os

# Global dictionaries
hospitals = {}
students = {}
hospital_pref = {}
student_pref = {}

def load_input(filename):
    global hospitals, students, hospital_pref, student_pref
    filename = "tests/" + filename 
    
    # Check if file exists and is not empty
    if not os.path.exists(filename) or os.stat(filename).st_size == 0:
        print("INVALID: File is empty or does not exist.")
        return False

    with open(filename, 'r') as f:
        content = f.read().splitlines()
        lines = [line.strip() for line in content if line.strip()]

    if not lines:
        print("INVALID: No data found in file.")
        return False

    try:
        n = int(lines[0])
    except ValueError:
        print("INVALID: First line must be an integer n.")
        return False

    if n < 1:
        print("INVALID: n must be at least 1.")
        return False

    if len(lines) < (2 * n + 1):
        print("INVALID: Missing preference lists. Check if n matches line count.")
        return False

    # Initialize hospitals and students dicts
    hospitals = {f"H{i}": "" for i in range(1, n + 1)}
    students = {f"S{i}": 0 for i in range(1, n + 1)}
    
    valid_range = set(range(1, n + 1))

    # Parse hospital preferences
    for i in range(1, n + 1):
        try:
            prefs = list(map(int, lines[i].split()))
        except ValueError:
            print(f"INVALID: Preferences for H{i} must be integers.")
            return False

        # Range and Permutation check
        if len(prefs) != n or set(prefs) != valid_range:
            print(f"INVALID: Hospital H{i} list must be a permutation of 1..{n}.")
            return False
            
        h_id = f"H{i}"
        hospital_pref[h_id] = {f"S{s_num}": rank + 1 for rank, s_num in enumerate(prefs)}

    # Parse student preferences
    for i in range(1, n + 1):
        try:
            prefs = list(map(int, lines[i + n].split()))
        except ValueError:
            print(f"INVALID: Preferences for S{i} must be integers.")
            return False

        # Range and Permutation check
        if len(prefs) != n or set(prefs) != valid_range:
            print(f"INVALID: Student S{i} list must be a permutation of 1..{n}.")
            return False
            
        s_id = f"S{i}"
        student_pref[s_id] = {f"H{h_num}": rank + 1 for rank, h_num in enumerate(prefs)}
    
    return True

def get_ranked():
    i = 0
    while True:
        finished = True
        i += 1
        # print(f"--- Iteration {i} ---")
        
        for student, count in students.items():
            # Only let the student look for a hospital if they are currently unassigned 
            if students[student] == 0:
                for hospital, rank in student_pref[student].items():
                    a = hospital
                    
                    # If the hospital is free, assign it and STOP this student's loop ;1 for assigned, 0 for unassigned
                    if hospitals[a] == "":
                        hospitals[a] = student
                        students[student] = 1
                        break # Move to the next student
                    
                    # If hospital is busy, check if they like this student better
                    elif hospital_pref[a][student] < hospital_pref[a][hospitals[a]]:
                        old_student = hospitals[a]
                        students[old_student] = 0 
                        
                        hospitals[a] = student
                        students[student] = 1 
                        break 
        
        # for hospital, student in hospitals.items():
        #     print(f"{hospital} : {student}")
            
        # Check if every student has exactly 1 assignment
        for student, picked in students.items():
            finished = finished and (picked == 1)
            
        if finished:
            break
    # for hospital, student in hospitals.items():
    #     print(f"{hospital} : {student}")
    # for student, count in students.items():
    #     print(f"{student} : {count}")

def check_valid():
    # Stability check with your logic
    for hosp, stud in hospitals.items():
        if stud == "":
            print(f"INVALID: {hosp} is unassigned.")
            return False
            
    for stud, count in students.items():
        if count == 0:
            print(f"INVALID: {stud} is unassigned.")
            return False

    for hosp, current_student in hospitals.items():
        for alt_student, alt_hosp_pref_rank in hospital_pref[hosp].items():
            if alt_hosp_pref_rank < hospital_pref[hosp][current_student]:
                assigned_hosp = ""
                for h, s in hospitals.items():
                    if s == alt_student:
                        assigned_hosp = h
                
                if student_pref[alt_student][hosp] < student_pref[alt_student][assigned_hosp]:
                    h_idx = hosp.replace("H", "")
                    s_idx = alt_student.replace("S", "")
                    print(f"UNSTABLE (Blocking pair: {h_idx}, {s_idx})")
                    return False
                    
    print("VALID STABLE")
    return True

def print_output():
    output_lines = []
    for h_key, s_key in hospitals.items():
        h_num = h_key.replace("H", "")
        s_num = s_key.replace("S", "")
        output_lines.append(f"{h_num} {s_num}")
    
    output_lines.sort(key=lambda x: int(x.split()[0]))
    for line in output_lines:
        print(line)

if __name__ == "__main__":
    test_files = ['example.in', 'one_to_one.in', 'bad_range.in', 'unstable.in', 'empty.in', 'duplicate.in', 'another_test.in']

    for filename in test_files:
        print(f"\n--- Testing: {filename} ---")
        # Reset globals for each test
        hospitals, students, hospital_pref, student_pref = {}, {}, {}, {}
        
        if load_input(filename):
            get_ranked()
            print_output()
            check_valid()