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

    # Ensure /usr/bin is prioritized in PATH
    if [[ ":$PATH:" != *":/usr/bin:"* ]]; then
        echo "Prepending /usr/bin to PATH."
        export PATH="/usr/bin:$PATH"
        echo "Updated PATH: $PATH"
    else
        echo "/usr/bin already in PATH: $PATH"
    fi

    echo "Attempting to install dlib directly using pip..."
    pip3 install --disable-pip-version-check --verbose --target . dlib==20.0.0
    echo "dlib installation attempt finished."
else
    echo "WARNING: CMake not found or not executable. Skipping dlib installation within build.sh."
fi

echo "BUILD.SH (for @vercel/python) EXECUTION FINISHED. Proceeding to Vercel's main pip install." 