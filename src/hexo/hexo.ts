import { HexoPost, HexoPostFormatter, HexoPostImage } from './hexo-entities.js'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
export class Hexo
{
    constructor()
    {

    }
    parseHexoPost(markdown: string) : HexoPost
    {
        var HexoPost: HexoPost = {
            formatter: {
                title: "",
                tags: [],
                categories: [],
                comments: false
            },
            brief: "",
            content: ""
        }
        const pattern = /---\s*([\s\S]*?)\s*---([\s\S]*)/
        var matches = markdown.match(pattern)
        if (matches != null) {
            //匹配成功
            const formatterMatch = matches[1]
            const contentMatch = matches[2]
            const formatterObj = yaml.load(formatterMatch) as HexoPostFormatter
            HexoPost.formatter = formatterObj
            if (contentMatch.includes('<!--more-->')) {
                const content = contentMatch.split('<!--more-->')
                HexoPost.brief = content[0]
                HexoPost.content = content[1]
            }
            else {
                HexoPost.content = contentMatch
            }
        }
        return HexoPost
    }
    writeHexoPost(hexoPost: HexoPost, savePath: string):void
    {
        const content = `---
${yaml.dump(hexoPost.formatter, { indent: 2, flowLevel: 2 })}
---
${hexoPost.brief}
<!--more-->
${hexoPost.content}`
        fs.writeFileSync(`${savePath}/${hexoPost.formatter.title}.md`, content)
    }
    writeHexoPostImage(hexoPostImage: HexoPostImage, savePath: string):void
    {
        if (!fs.existsSync(`${savePath}/${hexoPostImage.group}`)) {
            fs.mkdirSync(`${savePath}/${hexoPostImage.group}`)
        }
        fs.writeFileSync(`${savePath}/${hexoPostImage.group}/${hexoPostImage.name}`, hexoPostImage.buffer, { flag: 'w' })
    }
    formatHexoPostImage2Halo(hexoPost: HexoPost) : void{
        const pattern = /!\[([\s\S]*)\]\(\.\/[\s\S]*\/([\s\S]*)\)/
        var matches = hexoPost.content.match(pattern)
        if (matches != null) {
            //匹配成功
            hexoPost.content = hexoPost.content.replace(pattern, `![${matches[1]}](upload/${matches[2]})`)
        }
    }
    loadMarkdown(path: string) : Array<{hexoPost:HexoPost, path:string}>
    {
        //读取目标路径下的所有md文件
        const files = fs.readdirSync(path)
        const posts = new Array<{ hexoPost: HexoPost, path: string }>()
        files.forEach(file => {
                if (file.endsWith('.md')) {
                    const markdown = fs.readFileSync(`${path}/${file}`, 'utf-8')
                    const hexoPost = this.parseHexoPost(markdown)
                    this.formatHexoPostImage2Halo(hexoPost)
                    posts.push({ hexoPost:hexoPost, path:`${path}/${file}`})
                }
            }
        )
        return posts
    }
    loadMarkdownImage(path: string) : Array<HexoPostImage>
    {
        //读取目标路径下的所有子文件夹
        let dirs = fs.readdirSync(path)
        //去除隐藏文件夹和md文件
        dirs = dirs.filter(dir => !dir.startsWith('.') && !dir.endsWith('.md') && !dir.endsWith('.sh'))
        const images = new Array<HexoPostImage>()
        dirs.forEach(dir => {
            let files = fs.readdirSync(`${path}/${dir}`)
            //是否是图片格式
            files = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))
            files.forEach(file => {
                const buffer = fs.readFileSync(`${path}/${dir}/${file}`)
                images.push({ name: file, group: dir, buffer: buffer })
            })
        })
        return images
    }
}



