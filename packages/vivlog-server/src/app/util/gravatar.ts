import md5 from 'md5'

interface Options {
    source?: string
    parameters?: string
}

export function gravatarFromEmail(
    email: string,
    options?: Options
) {

    const hash = md5(email.trim().toLowerCase())

    const defaults = {
        // source: 'https://www.gravatar.com/avatar/',
        source: 'https://cravatar.cn/avatar/',
        parameters: 'd=identicon'
    }

    const opts = { ...defaults, ...options }

    return `${opts.source}${hash}?${opts.parameters}`

}
