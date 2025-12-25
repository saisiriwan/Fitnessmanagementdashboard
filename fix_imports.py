import os

path = r"c:\src\ปริญญานิพนธ์\Fitness-project\FitnessManagementDashboard\src\App.tsx"
print(f"Reading file: {path}")

try:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    print(f"File length: {len(content)}")
    
    # Check if the string exists
    target1 = '@/components/page/Trainee/TraineeDashboard'
    if target1 in content:
        print(f"Found '{target1}'")
    else:
        print(f"Did NOT find '{target1}'")

    new_content = content.replace('@/components/page/Trainee/TraineeDashboard', './components/page/Trainee/TraineeDashboard')
    new_content = new_content.replace('@/components/page/Trainee/Layout', './components/page/Trainee/Layout')

    if content == new_content:
        print("No changes made.")
    else:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("File updated successfully.")

except Exception as e:
    print(f"Error: {e}")
