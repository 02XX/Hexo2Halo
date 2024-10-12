import { coreApiClient, consoleApiClient, axiosInstance } from '@halo-dev/api-client'
import { Halo } from '../halo/halo.js'
import { Hexo } from '../hexo/hexo.js'
import { HexoPost } from '../hexo/hexo-entities.js'
import limax from 'limax';
import { randomUUID } from 'crypto'
import markdownit from 'markdown-it'
import MarkdownIt from "markdown-it";
import { katex } from '@mdit/plugin-katex'
import * as https from 'https';
const siteUrl = "https://114.213.212.248"
const token = "pat_eyJraWQiOiJsQ3U0VXUzNVVqR201UHJoZUMxelV2MzFTTk5fcHVtS3poYlJMUVltcldJIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwOi8vMTE0LjIxMy4yMTIuMjQ4OjgwOTAvIiwic3ViIjoiMDIiLCJpYXQiOjE3Mjg3MzMwOTgsImp0aSI6ImY3ODlkNTZiLTZmM2EtMDQ4Ny01NTRlLWRlNzJjYjJjN2FlMCIsInBhdF9uYW1lIjoicGF0LTAyLW94WHhxIn0.BNsoBzXnFVVKGQBqKcAWElz2ARKa8KSaYuMsAMjs3eQimEOtFq7klDhm_xBlSYAn9ltGRtj7AkiQyvg8zOvMfoUDzzrdH1mXkrMGzP3dSFJeD91eI5o5HNXMkXwvv8yDYy2yjUE7p68Ezrh4lr9KyhBW3ey5JRHxbEYvoQT2qSg9Qu-0ZoatpqlVDQ5TY-yHjItJ5-PAvvICEST9Xk1bRVT-vbJre1dHYwH0vlxfYAxh9y8Fr8EVQAf90yref7ag4BfhNqQo6gnPBLD8kl13spJwO2s2PZnWO1k4B01bPodHeRTqefTEzaLJwJwxF7Eb8JnTrHMZnV3BSvSIgEnCF3lzwBrIqKKnECooiBhr-9b9fCM4c7PLFBTLMRkwcxBWMl1ofA4EMghkmKmyuPcOPLIUAxG3JxtB3BNS4ouJtqKfR1xTXQaqVnU8PzAS7M90rzDNIcGRdzkN2Unt-wtJPaxa0hISJaIwG6Ze5pEvd9vZWTk6d_OuzxdNuJTA8a3uhTSJYqVh-hC0NRVu6KciefY-3U644uya13uZC8p5gBq04DBaIqbLoYA93lvZyVNU5Wt9zU4FsSJgU9nVOA9U6ovAgkshizJ0cF5eK-YFAaqlS-6Cd8i6UkzMIR_MQFHQHcQ11y59jonwJYZc2IMBkT1XOHQMgYs1IPJpehJ2KzY"
const hexoPostPath = "/media/zero/Data/MBlog/API/Articles"
const haloAttachmentPath = "/home/zero/halo/halo2/attachments/upload"
const savePath = "test"

axiosInstance.defaults.baseURL = siteUrl
axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
axiosInstance.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized: false  // 忽略证书验证
});

const markdownIt = new markdownit().use(katex)
const data = await consoleApiClient.content.post.draftPost({
    postRequest: {
        post: {
            spec: {
                title: "测试标题",
                slug: limax("测试标题", { tone: false }),
                owner: "02",
                // template: "",
                // cover: "",
                deleted: false,
                publish: true,
                pinned: false,
                allowComment: true,
                visible: "PUBLIC",
                priority: 0,
                excerpt: {
                    autoGenerate: true,
                    raw: "",
                },
                categories: [],
                tags: [],
                htmlMetas: [
                ],
            },
            status: {
                phase: "PUBLISHED",
            },
            apiVersion: "content.halo.run/v1alpha1",
            kind: "Post",
            metadata: {
                name: randomUUID(),
            },
        },
        content: {
            raw: "测试内容",
            rawType: "markdown",
            content: markdownIt.render("测试内容"),
        }
    }
})
