import * as ts from "typescript";

function extractTypeSignature(filename: string, aliasName: string): string {

    const program: ts.Program = ts.createProgram([filename], { emitDeclarationOnly: true });
    const sourceFile: ts.SourceFile = program.getSourceFile(filename) ?? (() => { throw new Error(`File: '${filename}' not found`); })();
    const typeChecker: ts.TypeChecker = program.getTypeChecker();
    // Get the declaration node you're looking for by it's type name.
    // This condition can be adjusted to your needs
    const statement: ts.Statement | undefined = sourceFile.statements.find(
        (s) => ts.isTypeAliasDeclaration(s) && s.name.text === aliasName
    );
    if (!statement) {
        throw new Error(`Type: '${aliasName}' not found in file: '${filename}'`);
    }
    const type: ts.Type = typeChecker.getTypeAtLocation(statement);
    const fields: string[] = [];
    // Iterate over the `ts.Symbol`s representing Property Nodes of `ts.Type`
    for (const prop of type.getProperties()) {
        const name: string = prop.getName();
        const propType: ts.Type = typeChecker.getTypeOfSymbolAtLocation(prop, statement);
        const propTypeName: string = typeChecker.typeToString(propType);
        fields.push(`${name}: ${propTypeName};`);
    }
    return `type ${aliasName} = {\n  ${fields.join("\n  ")}\n}`;
}

function parseArgs(args: string[]): { [key: string]: string } {
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

function printUsage() {
    console.log("Usage: ts-node type_printer.ts --filename <filename> --alias-name <alias-name>");
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const filename = args["filename"] ?? args["f"] ?? null
    if (!filename) {
        console.error("Missing filename");
        printUsage();
        return;
    }
    const aliasName = args["alias-name"] ?? args["a"] ?? null
    if (!aliasName) {
        console.error("Missing alias name");
        printUsage();
        return;
    }
    const output = extractTypeSignature(filename, aliasName);
    console.log(output);
}

main();
