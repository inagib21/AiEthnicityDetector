#!/bin/bash
# Exit immediately if a command exits with a non-zero status, and print each command before executing it.
set -ex

echo "BUILD.SH (for @vercel/python) EXECUTION STARTED"
echo "Initial PATH: $PATH"
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
CMAKE_PATH=$(which cmake || echo "cmake_not_found")
echo "cmake path: $CMAKE_PATH"

if [ "$CMAKE_PATH" != "cmake_not_found" ] && [ -x "$CMAKE_PATH" ]; then
    echo "CMake found at $CMAKE_PATH and is executable."
    echo "CMake version:"
    "$CMAKE_PATH" --version
    
    echo "Exporting CMAKE_EXECUTABLE=$CMAKE_PATH"
    export CMAKE_EXECUTABLE="$CMAKE_PATH"
    echo "CMAKE_EXECUTABLE is now: $CMAKE_EXECUTABLE"
else
    echo "WARNING: CMake not found or not executable at the expected location after installation."
fi

# Ensure /usr/bin is prioritized in PATH (attempt from previous step, kept for good measure)
if [[ -x "/usr/bin/cmake" ]]; then
    echo "Found /usr/bin/cmake. Ensuring /usr/bin is in PATH."
    if [[ ":$PATH:" != *":/usr/bin:"* ]]; then
        export PATH="/usr/bin:$PATH"
        echo "Updated PATH: $PATH"
    else
        echo "/usr/bin already in PATH: $PATH"
    fi
else
    echo "WARNING: /usr/bin/cmake not found or not executable. Cannot ensure it is in PATH."
fi

echo "BUILD.SH (for @vercel/python) EXECUTION FINISHED. Proceeding to Vercel's pip install." 