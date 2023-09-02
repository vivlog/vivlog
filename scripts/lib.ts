import { promises as fs } from 'fs';
import * as readline from 'node:readline/promises';

export function parseArgs(args: string[]): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    let key: string | undefined;
    for (const arg of args) {
        if (arg.startsWith("--")) {
            key = arg.slice(2);
            result[key] = "";
        }
        else if (arg.startsWith("-")) {
            key = arg.slice(1);
            result[key] = "";
        }
        else if (key) {
            result[key] += arg;
        }
    }

    return result;
}

export const expectInput = (prompt: string) => {
    return async () => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const answer = await rl.question(prompt)
        rl.close()
        return answer
    }
}

export function pascalCase(snakeCase: string): string {
    return snakeCase.split("_").map(s => s[0].toUpperCase() + s.slice(1)).join("")
}

export function camelCase(snakeCase: string): string {
    const pascal = pascalCase(snakeCase)
    return pascal[0].toLowerCase() + pascal.slice(1)
}

export function kebabCase(snakeCase: string): string {
    return snakeCase.split("_").join("-")
}

export function titleCase(snakeCase: string): string {
    return snakeCase.split("_").map(s => s[0].toUpperCase() + s.slice(1)).join(" ")
}

export async function isFileOrDirectory(path: string): Promise<"file" | "directory" | null> {
    try {
        const stat = await fs.stat(path)
        if (stat.isFile()) {
            return "file"
        }
        else if (stat.isDirectory()) {
            return "directory"
        }
        else {
            return null
        }
    }
    catch (e) {
        return null
    }
}

export async function isExists(path: string): Promise<boolean> {
    return (await isFileOrDirectory(path)) !== null
}

export function directoryOf(path: string): string {
    return path.split("/").slice(0, -1).join("/")
}

export async function makeAllDirectories(path: string) {
    const parts = path.split("/")
    let current = ""
    for (const part of parts) {
        current += part + "/"
        if (!(await isExists(current))) {
            await fs.mkdir(current)
        }
    }
}
