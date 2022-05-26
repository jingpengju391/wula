export type ImgLoad = {
    placeholder: boolean
    style?: SrcString
    src: string
    preview: Preview | boolean  
    fallback: string
    height?: number
    onClick?: Function
    sourcePath?: string
}

type SrcString = {
    maxWidth: number
    maxHeight: number
}

type Preview = {
    visible: boolean
}