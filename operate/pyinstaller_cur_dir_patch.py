import sys
from pathlib import Path


# Define a runtime hook to patch the _CUR_DIR value
def patch_cur_dir():
    import your_module_name
    if getattr(sys, 'frozen', False):
        your_module_name._CUR_DIR = Path(sys._MEIPASS) / your_module_name._CUR_DIR

