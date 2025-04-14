import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default [
    // ESM 输出
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.mjs",
            format: "esm",
            sourcemap: true,
        },
        plugins: [typescript({ tsconfig: "./tsconfig.json" }), terser()],
    },
    // CJS 输出
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.cjs",
            format: "cjs",
            sourcemap: true,
            exports: "named",
        },
        plugins: [typescript({ tsconfig: "./tsconfig.json" }), terser()],
    },
];
