"""
Updates web_app/acep_paper_content.js by dynamically scanning all generated MATLAB files in matlab/
and packaging them into the web app's interactive catalog.
"""
import os
import json

BASE_DIR = os.path.dirname(__file__)
MATLAB_DIR = os.path.join(BASE_DIR, 'matlab')
JS_FILE = os.path.join(BASE_DIR, 'web_app', 'acep_paper_content.js')

def scan_modules():
    modules = []
    for root, dirs, files in os.walk(MATLAB_DIR):
        for f in sorted(files):
            if f.endswith('.m'):
                rel_dir = os.path.relpath(root, MATLAB_DIR)
                cat_name = rel_dir.replace('_', ' ').title() if rel_dir != '.' else 'Core Orchestration'
                file_path = os.path.join(root, f)
                try:
                    with open(file_path, 'r', encoding='utf-8') as fp:
                        content = fp.read()
                        # Extract first comment line as description
                        lines = content.splitlines()
                        desc = f"ACEP module: {f}"
                        for l in lines[1:5]:
                            if l.strip().startswith('%'):
                                desc = l.strip().lstrip('%').strip()
                                break
                        modules.append({
                            "name": f,
                            "category": cat_name,
                            "desc": desc,
                            "code": content
                        })
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    return modules

def main():
    modules = scan_modules()
    print(f"Scanned {len(modules)} total MATLAB modules.")

    # Read current JS file to preserve breakthroughs
    with open(JS_FILE, 'r', encoding='utf-8') as f:
        existing_js = f.read()

    # Locate breakthroughs JSON section
    bt_start = existing_js.find('breakthroughs: {')
    if bt_start == -1:
        print("Could not find breakthroughs in JS file!")
        return
    bt_section = existing_js[bt_start:]

    # Construct updated JS
    modules_json = json.dumps(modules, indent=2)
    new_content = f"""/**
 * ACEP Knowledge & Paper Content Store
 * Contains complete catalog of {len(modules)} MATLAB research modules,
 * 50 Breakthroughs, and full IEEE Paper metadata.
 */

window.ACEP_DATA = {{
  // =========================================================================
  // {len(modules)} RESEARCH-GRADE MATLAB MODULES CATALOG
  // =========================================================================
  matlabModules: {modules_json},

  // =========================================================================
  // 50 BREAKTHROUGHS CATALOG
  // =========================================================================
  {bt_section}
"""

    with open(JS_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Successfully updated {JS_FILE} with {len(modules)} modules!")

if __name__ == '__main__':
    main()
