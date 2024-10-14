import { coreApiClient } from '@halo-dev/api-client'
import {Halo} from './halo/halo.js'
import { Hexo } from './hexo/hexo.js'
import { HexoPost } from './hexo/hexo-entities.js'
import { correctData } from './halo/correctData.js'


const siteUrl = "Your site url"
const token = "Your token"
const hexoPostPath = ""
const haloAttachmentPath = ""
const savePath = ""

export const createHexo2Halo = async () => {
    const halo = new Halo(siteUrl, token)
    halo.initialize()
    const hexo = new Hexo()
    //同步hexo到halo
    const hexoPosts = hexo.loadMarkdown(hexoPostPath)
    for (const hexoPost of hexoPosts) {
        console.log(`开始同步文章${hexoPost.hexoPost.formatter.title}`)
        const data = await halo.CreatePostFormHexo(hexoPost.hexoPost)
        console.log(`同步文章${hexoPost.hexoPost.formatter.title} 成功`)
        //sleep 500ms
        await new Promise((resolve) => {
            setTimeout(resolve, 500)
        })
    }
    //同步图片到halo
    const hexoPostImages = hexo.loadMarkdownImage(hexoPostPath)
    for (const hexoPostImage of hexoPostImages) {
        console.log(`开始同步图片${hexoPostImage.group}/${hexoPostImage.name}`)
        const data = await halo.UploadImageFromHexo(hexoPostImage)
        console.log(`同步图片${hexoPostImage.group}/${hexoPostImage.name} 成功`)
        //sleep 500ms
        await new Promise((resolve) => {
            setTimeout(resolve, 500)
        })
    }
    //同步时间
    await correctData(hexoPosts.map(item => item.hexoPost))
}
export const updateHexo2Halo = async () => {
    const halo = new Halo(siteUrl, token)
    halo.initialize()
    const hexo = new Hexo()
    //同步hexo到halo
    const hexoPosts = hexo.loadMarkdown(hexoPostPath)
    for (const hexoPost of hexoPosts) {
        console.log(`开始更新文章: ${hexoPost.hexoPost.formatter.title}`)
        const data = await halo.UpdatePostFormHexo(hexoPost.hexoPost)
        console.log(`更新文章: ${hexoPost.hexoPost.formatter.title} 成功`)
        //sleep 500ms
        await new Promise((resolve) => {
            setTimeout(resolve, 500)
        })
    }
    //同步图片到halo
    const hexoPostImages = hexo.loadMarkdownImage(hexoPostPath)
    for (const hexoPostImage of hexoPostImages) {
        console.log(`开始更新图片: ${hexoPostImage.group}/${hexoPostImage.name}`)
        const data = await halo.UploadImageFromHexo(hexoPostImage)
        console.log(`更新图片: ${hexoPostImage.group}/${hexoPostImage.name} 成功`)
        //sleep 500ms
        await new Promise((resolve) => {
            setTimeout(resolve, 500)
        })
    }
}
export const createHalo2Hexo = async () => {
    const halo = new Halo(siteUrl,token)
    halo.initialize()
    const hexo = new Hexo()
    //更新halo到hexo
    const posts = await halo.CreatePostFormHalo()
    for (const post of posts) {
        console.log(`开始同步文章${post.formatter.title}`)
        hexo.writeHexoPost(post, savePath)
        console.log(`同步文章${post.formatter.title}成功`)
    }
    //更新图片到hexo
    const images = await halo.CreatePostImageFromHalo(haloAttachmentPath)
    for (const image of images) {
        console.log(`开始同步图片${image.group}/${image.name}`)
        hexo.writeHexoPostImage(image, savePath)
        console.log(`同步图片${image.group}/${image.name}成功`)
    }
}
export const correctPostDate = async () => {
    var hexo = new Hexo()
    var posts = hexo.loadMarkdown(hexoPostPath)
    await correctData(posts.map(item=>item.hexoPost))
}





