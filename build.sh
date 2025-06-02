#!/bin/bash
# Exit immediately if a command exits with a non-zero status, and print each command before executing it.
set -ex

echo "BUILD.SH (for @vercel/python) EXECUTION STARTED"
echo "Current directory: $(pwd)"
echo "Listing files in current directory (root):"
ls -la

echo "Running apt-get update..."
apt-get update -y
echo "APT-GET UPDATE FINISHED"

echo "Installing cmake and build-essential..."
apt-get install -y cmake build-essential
echo "APT-GET INSTALL CMAKE BUILD-ESSENTIAL FINISHED"

echo "Verifying cmake installation..."
if command -v cmake &> /dev/null
then
    echo "cmake command is found by 'command -v cmake'"
    echo "Location: $(which cmake)"
    echo "Version:"
    cmake --version
else
    echo "cmake command NOT FOUND by 'command -v cmake' after install attempt!"
fi
echo "CMAKE INFO PRINTED."

echo "BUILD.SH (for @vercel/python) EXECUTION FINISHED. Proceeding to Vercel's pip install." 