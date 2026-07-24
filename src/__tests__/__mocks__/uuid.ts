// The real "uuid" package (v14) ships ESM-only, which ts-jest's CommonJS
// output can't require(). Jest only ever needs *some* unique string here
// (used for generated upload filenames), so swap in Node's built-in
// randomUUID instead of teaching Jest to parse an ESM-only dependency.
import { randomUUID } from "crypto";

export const v4 = () => randomUUID();
