/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      // Keep existing routes
      {
        source: "/api/py/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/:path*"
            : "/api/",
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/docs"
            : "/api/py/docs",
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/openapi.json"
            : "/api/py/openapi.json",
           
      },
      // Add our new face analysis routes
      {
        source: "/api/analyze-face",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/analyze-face"
            : "/api/py/analyze-face",
      },
      {
        source: "/api/save-analysis",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/save-analysis"
            : "/api/py/save-analysis",
      },
    ];
  },
  
};

module.exports = nextConfig;