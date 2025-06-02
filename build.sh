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

echo "Verifying cmake installation (Attempt 1)..."
CMAKE_LOCATION_ATTEMPT_1=$(which cmake || echo "cmake_not_found")
echo "cmake location (Attempt 1): $CMAKE_LOCATION_ATTEMPT_1"
if [ "$CMAKE_LOCATION_ATTEMPT_1" != "cmake_not_found" ]; then
    echo "cmake version (Attempt 1):"
    cmake --version
else
    echo "cmake not found at Attempt 1."
fi

# Ensure /usr/bin is prioritized in PATH
if [[ -x "/usr/bin/cmake" ]]; then
    echo "Found /usr/bin/cmake. Prepending /usr/bin to PATH."
    export PATH="/usr/bin:$PATH"
    echo "Updated PATH: $PATH"

    echo "Verifying cmake installation (Attempt 2, after PATH modification)..."
    CMAKE_LOCATION_ATTEMPT_2=$(which cmake || echo "cmake_not_found_post_path_mod")
    echo "cmake location (Attempt 2): $CMAKE_LOCATION_ATTEMPT_2"
    if [ "$CMAKE_LOCATION_ATTEMPT_2" != "cmake_not_found_post_path_mod" ]; then
        echo "cmake version (Attempt 2):"
        cmake --version
    else
        echo "cmake not found at Attempt 2."
    fi
else
    echo "WARNING: /usr/bin/cmake not found or not executable. Cannot prepend to PATH."
fi

echo "BUILD.SH (for @vercel/python) EXECUTION FINISHED. Proceeding to Vercel's pip install." 