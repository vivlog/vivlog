export const defaultRawConfig = {
    port: '9000',
    extensionDir: '',
    dbPath: '',
    jwtSecret: 'secret',
}

export type ConfigType = typeof defaultRawConfig

export const configKeys = Object.keys(defaultRawConfig) as (keyof ConfigType)[]



// export type Bit = Image | Code | Link | Note | FlashCard

// export type Requirements = TakeNote | UploadImage | KeepNoticed | ShareCode | LearnFlashCard

// export type HostKind = SelfHost | Cloud | LocalHost

// const keepNoticed = {
//     eventType: [
//         'time-pass',
//         'location', // enter, leave, stay, near

//     ],
//     eventSource: [
//         'phone', // a phone is a gps device
//         'sensor', // such as a camera or a microphone
//     ]
// }

// type Idea = A_Markdown_Colab_Editor // hackmd
//      | A_Pixel_Editor // piskel
//      | Dictation_Generator // dictation.io
//         | A_Note_Taking_App // apple note
//         | A_Diagram_Drawing_App // draw.io
//         | A_Mind_Mapping_App // mindnode
//         | A_Flash_Card_App // anki

// // people use apple note instead of other note apps because it's easy to use
// // keep it simple!

// // A pixel editor that can be used to draw a pixel art

// // Why apple's alarm is so good?

// // Draw.io is a good tool to draw a diagram, but it's not easy to use
// // people use a lot of time to place boxes and arrows
// // image that you're drawing a automata
