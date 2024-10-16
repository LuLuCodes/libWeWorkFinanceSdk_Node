{
    "targets": [
        {
            "target_name": "WeWorkFinanceSDK",
            "sources": ["libWeWorkFinanceSdk_Node.cpp"],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")",
                "."
            ],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').gyp\")"
            ],
            "cflags": ["-fexceptions"],
            "cflags_cc": ["-fexceptions"],
        }
    ]
}
