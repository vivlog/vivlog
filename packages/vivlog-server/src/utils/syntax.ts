export function pascalCase(snakeCase: string): string {
    return snakeCase.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join('')
}

export function camelCase(snakeCase: string): string {
    const pascal = pascalCase(snakeCase)
    return pascal[0].toLowerCase() + pascal.slice(1)
}

export function kebabCase(snakeCase: string): string {
    return snakeCase.split('_').join('-')
}

export function titleCase(snakeCase: string): string {
    return snakeCase.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')
}
