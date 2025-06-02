#!/bin/bash
# Exit immediately if a command exits with a non-zero status, and print each command before executing it.
set -ex

echo "BUILD.SH SCRIPT EXECUTION STARTED"

echo "Running apt-get update..."
apt-get update -y

echo "APT-GET UPDATE FINISHED"

echo "Installing cmake and build-essential..."
apt-get install -y cmake build-essential

echo "APT-GET INSTALL CMAKE BUILD-ESSENTIAL FINISHED"

echo "Verifying cmake installation..."
which cmake
cmake --version

echo "CMAKE INFO PRINTED. BUILD.SH SCRIPT EXECUTION FINISHED."

# Upgrade pip and install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "Python dependencies installed successfully." 