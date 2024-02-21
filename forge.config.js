module.exports= {
    "packagerConfig": {
        "files": [
            ".env", // Include the .env file (ensure NODE_ENV is set to production)
            "frontend/.next/**/*", // Include the .next folder, requires build to be run first
        ]
    }
}
