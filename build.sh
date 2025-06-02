#!/bin/bash
# Exit immediately if a command exits with a non-zero status, and print each command before executing it.
set -ex

echo "BUILD.SH (STATIC-BUILD) EXECUTION STARTED"

echo "Running apt-get update..."
apt-get update -y

echo "APT-GET UPDATE FINISHED"

echo "Installing cmake and build-essential..."
apt-get install -y cmake build-essential

echo "APT-GET INSTALL CMAKE BUILD-ESSENTIAL FINISHED"

echo "Verifying cmake installation..."
which cmake
cmake --version

echo "CMAKE INFO PRINTED."

echo "Creating output directory structure for Python function..."

echo "Upgrading pip..."
python3 -m pip install --user --upgrade pip
echo "PIP UPGRADED."

echo "Installing Python dependencies from requirements.txt into the current directory..."
python3 -m pip install --target=. -r requirements.txt
echo "PYTHON DEPENDENCIES INSTALLATION FINISHED."

if [ -d "FairFace" ]; then
  echo "FairFace directory found."
else
  echo "WARNING: FairFace directory NOT found in build context!"
fi

echo "BUILD.SH (STATIC-BUILD) EXECUTION FINISHED." 