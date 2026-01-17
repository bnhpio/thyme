import { randomUUID } from "node:crypto";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
function serializeValue(value, depth = 0) {
    if (depth > 10) return '[Max Depth Reached]';
    if (null === value) return 'null';
    if (void 0 === value) return 'undefined';
    if (value instanceof Error) return `Error: ${value.name} - ${value.message}${value.stack ? `\n${value.stack}` : ''}`;
    const type = typeof value;
    if ('string' === type) return value;
    if ('number' === type || 'boolean' === type) return String(value);
    if ('bigint' === type) return `${value}n`;
    if ('symbol' === type) return String(value);
    if ('function' === type) {
        const func = value;
        return `[Function: ${func.name || 'anonymous'}]`;
    }
    if (Array.isArray(value)) {
        if (0 === value.length) return '[]';
        const items = value.map((item)=>serializeValue(item, depth + 1));
        return `[${items.join(', ')}]`;
    }
    if ('object' === type) try {
        const seen = new WeakSet();
        const replacer = (_key, val)=>{
            if (null == val) return val;
            if ('object' == typeof val) {
                if (seen.has(val)) return '[Circular]';
                seen.add(val);
            }
            if (val instanceof Error) return {
                name: val.name,
                message: val.message,
                stack: val.stack
            };
            return val;
        };
        return JSON.stringify(value, replacer, 2);
    } catch (error) {
        return `[Object: ${String(error)}]`;
    }
    return String(value);
}
async function sandbox(args) {
    const logs = [];
    const originalConsole = {
        ...console
    };
    const captureConsole = ()=>{
        console.log = (...args)=>{
            const serialized = args.map((arg)=>serializeValue(arg)).join(' ');
            logs.push(`[LOG] ${serialized}`);
            originalConsole.log(...args);
        };
        console.warn = (...args)=>{
            const serialized = args.map((arg)=>serializeValue(arg)).join(' ');
            logs.push(`[WARN] ${serialized}`);
            originalConsole.warn(...args);
        };
        console.error = (...args)=>{
            const serialized = args.map((arg)=>serializeValue(arg)).join(' ');
            logs.push(`[ERROR] ${serialized}`);
            originalConsole.error(...args);
        };
        console.info = (...args)=>{
            const serialized = args.map((arg)=>serializeValue(arg)).join(' ');
            logs.push(`[INFO] ${serialized}`);
            originalConsole.info(...args);
        };
    };
    const restoreConsole = ()=>{
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
        console.info = originalConsole.info;
    };
    const hideProcessEnv = ()=>{
        process.env = {};
    };
    let tempFile = null;
    try {
        tempFile = join(tmpdir(), `thyme-sandbox-${randomUUID()}.mjs`);
        writeFileSync(tempFile, args.file, 'utf-8');
        captureConsole();
        hideProcessEnv();
        const module = await import(`file://${tempFile}`);
        const runner = module.default;
        if (!runner) throw new Error('Default export is not available. Make sure your template exports default: export default { run, fail, success }');
        if (!runner.run || 'function' != typeof runner.run) throw new Error('run function is not available. Make sure your template exports default with a run function: export default { run: onRun<Args>(async (ctx) => { ... }) }');
        const contextObj = {
            userArgs: args.context.userArgs,
            secrets: args.context.secrets
        };
        const result = await runner.run(contextObj);
        restoreConsole();
        console.log('result', result);
        console.log('logs', logs);
        return {
            logs,
            result
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Sandbox execution failed: ${errorMessage}`);
    } finally{
        restoreConsole();
        if (tempFile) try {
            unlinkSync(tempFile);
        } catch  {}
    }
}
export { sandbox };
