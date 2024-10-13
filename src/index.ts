import { coreApiClient } from '@halo-dev/api-client'
import {Halo} from './halo/halo.js'
import { Hexo } from './hexo/hexo.js'
import { HexoPost } from './hexo/hexo-entities.js'
import { correctData } from './halo/correctData.js'
const siteUrl = "http://marker.us.kg"
const token = "pat_eyJraWQiOiJsQ3U0VXUzNVVqR201UHJoZUMxelV2MzFTTk5fcHVtS3poYlJMUVltcldJIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwOi8vMTE0LjIxMy4yMTIuMjQ4OjgwOTAvIiwic3ViIjoiMDIiLCJpYXQiOjE3Mjg3MzMwOTgsImp0aSI6ImY3ODlkNTZiLTZmM2EtMDQ4Ny01NTRlLWRlNzJjYjJjN2FlMCIsInBhdF9uYW1lIjoicGF0LTAyLW94WHhxIn0.BNsoBzXnFVVKGQBqKcAWElz2ARKa8KSaYuMsAMjs3eQimEOtFq7klDhm_xBlSYAn9ltGRtj7AkiQyvg8zOvMfoUDzzrdH1mXkrMGzP3dSFJeD91eI5o5HNXMkXwvv8yDYy2yjUE7p68Ezrh4lr9KyhBW3ey5JRHxbEYvoQT2qSg9Qu-0ZoatpqlVDQ5TY-yHjItJ5-PAvvICEST9Xk1bRVT-vbJre1dHYwH0vlxfYAxh9y8Fr8EVQAf90yref7ag4BfhNqQo6gnPBLD8kl13spJwO2s2PZnWO1k4B01bPodHeRTqefTEzaLJwJwxF7Eb8JnTrHMZnV3BSvSIgEnCF3lzwBrIqKKnECooiBhr-9b9fCM4c7PLFBTLMRkwcxBWMl1ofA4EMghkmKmyuPcOPLIUAxG3JxtB3BNS4ouJtqKfR1xTXQaqVnU8PzAS7M90rzDNIcGRdzkN2Unt-wtJPaxa0hISJaIwG6Ze5pEvd9vZWTk6d_OuzxdNuJTA8a3uhTSJYqVh-hC0NRVu6KciefY-3U644uya13uZC8p5gBq04DBaIqbLoYA93lvZyVNU5Wt9zU4FsSJgU9nVOA9U6ovAgkshizJ0cF5eK-YFAaqlS-6Cd8i6UkzMIR_MQFHQHcQ11y59jonwJYZc2IMBkT1XOHQMgYs1IPJpehJ2KzY"
const hexoPostPath = "/media/zero/Data/MBlog/Articles/"
const haloAttachmentPath = "/home/zero/halo/halo2/attachments/upload"
const savePath = "test"

export const createHexo2Halo = async () => {
    const halo = new Halo(siteUrl, token)
    halo.initialize()
    const hexo = new Hexo()
    //同步hexo到halo
    const hexoPosts = hexo.loadMarkdown(hexoPostPath)
    for (const hexoPost of hexoPosts) {
        console.log(`开始同步文章${hexoPost.hexoPost.formatter.title}`)
        const data = await halo.CreatePostFormHexo(hexoPost.hexoPost)
        console.log(`同步文章${hexoPost.hexoPost.formatter.title}成功`)
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
        console.log(`同步图片${hexoPostImage.group}/${hexoPostImage.name}成功`)
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
        console.log(`开始更新文章${hexoPost.hexoPost.formatter.title}`)
        const data = await halo.UpdatePostFormHexo(hexoPost.hexoPost)
        console.log(`更新文章${hexoPost.hexoPost.formatter.title}成功`)
        //sleep 500ms
        await new Promise((resolve) => {
            setTimeout(resolve, 500)
        })
    }
    //同步图片到halo
    const hexoPostImages = hexo.loadMarkdownImage(hexoPostPath)
    for (const hexoPostImage of hexoPostImages) {
        console.log(`开始更新图片${hexoPostImage.group}/${hexoPostImage.name}`)
        const data = await halo.UploadImageFromHexo(hexoPostImage)
        console.log(`更新图片${hexoPostImage.group}/${hexoPostImage.name}成功`)
        //sleep 500ms
        await new Promise((resolve) => {
            setTimeout(resolve, 500)
        })
    }
}
export const createHalo2Hexo = async (event: any) => {
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
await updateHexo2Halo()
// await correctPostDate()




