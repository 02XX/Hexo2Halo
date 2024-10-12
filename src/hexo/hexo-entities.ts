export interface HexoPost {
    formatter: HexoPostFormatter
    brief: string
    content: string
}

export interface HexoPostFormatter
{
    title: string
    tags: Array<string>
    categories: Array<Array<string>>
    date?: Date
    updated?: Date
    comments: boolean
}
export interface HexoPostImage
{
    name: string
    group: string
    buffer: Buffer
}