#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "build.sh: Updating package list and installing system dependencies (cmake, build-essential)..."
apt-get update -y && apt-get install -y cmake build-essential
echo "build.sh: System dependencies installation complete."

# Upgrade pip and install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "Python dependencies installed successfully." 