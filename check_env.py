import sys
print("Python:", sys.version)
packages = ["numpy", "scipy", "soundfile", "fastapi", "uvicorn", "sklearn", "commpy"]
for pkg in packages:
    try:
        mod = __import__(pkg)
        v = getattr(mod, "__version__", "ok")
        print(f"  {pkg}: {v}")
    except ImportError:
        print(f"  {pkg}: NOT INSTALLED")
