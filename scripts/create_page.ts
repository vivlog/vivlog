import { promises as fs } from 'fs';
import { directoryOf, expectInput, isExists, kebabCase, makeAllDirectories, parseArgs, pascalCase, titleCase } from './lib';

const main = async () => {
    const args = parseArgs(process.argv.slice(2))
    const requiredArgs = [
        'module',
        'name'
    ]

    for (const arg of requiredArgs) {
        if (!args[arg]) {
            args[arg] = await expectInput(`Enter ${arg}: `)()
        }
    }

    const module_ = args.module
    const name_ = args.name

    const Module = pascalCase(module_)
    const Name = pascalCase(name_)
    const kmodule = kebabCase(module_)
    const kname = kebabCase(name_)
    const TitleName = titleCase(name_)

    const templates = [
        {
            path: `packages/vivlog-app/apps/expo/app/${kmodule}/${kname}.tsx`,
            template: `
                import { ${Module}${Name}Screen } from 'app/features/${kmodule}/${kname}-screen'
                import { Stack } from 'expo-router'
                
                export default function Screen() {
                    return (
                        <>
                        <Stack.Screen
                            options={{
                            title: '${Module}',
                            }}
                        />
                        <${Module}${Name}Screen />
                        </>
                    )
                }
            `
        },
        {
            path: `packages/vivlog-app/packages/app/features/${kmodule}/${kname}-screen.tsx`,
            template: `
                import { Button, H2, YStack } from '@my/ui'
                import { ChevronLeft } from '@tamagui/lucide-icons'
                import React from 'react'
                import { useLink } from 'solito/link'

                export function ${Module}${Name}Screen() {
                const link = useLink({
                    href: '/',
                })

                return (
                    <YStack f={1} marginTop={16} jc="center" ai="center" space>
                    <Button {...link} icon={ChevronLeft}>
                        Go Home
                    </Button>
                    <H2 ta="center" fow="700">${TitleName}</H2>
                    </YStack>
                )
                }`
        },
        {
            path: `packages/vivlog-app/apps/next/app/${kmodule}/${kname}/page.tsx`,
            template: `
                'use client'

                import { ${Module}${Name}Screen } from 'app/features/${kmodule}/${kname}-screen'
                
                export default ${Module}${Name}Screen
            `
        },
        {
            path: `packages/vivlog-app/apps/next/pages/${kmodule}/${kname}.tsx`,
            template: `
                import { ${Module}${Name}Screen } from 'app/features/${kmodule}/${kname}-screen'
                import Head from 'next/head'

                export default function Page() {
                return (
                    <>
                    <Head>
                        <title>${TitleName}</title>
                    </Head>
                    <${Module}${Name}Screen />
                    </>
                )
                }
            `
        },


    ]

    for (const template of templates) {
        if (await isExists(template.path)) {
            console.log(`${template.path} already exists`)
            continue
        }
        console.log(`Creating ${template.path}`)
        const dirName = directoryOf(template.path)
        await makeAllDirectories(dirName)
        await fs.writeFile(template.path, template.template)
    }
}

main()

