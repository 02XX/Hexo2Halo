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
const siteUrl = "http://localhost:8090"
const token = "pat_eyJraWQiOiJ4S01OWFdSRzU5ZXNaeE9DaWpIamFoaEQxeE41bUpqNDNSNlZwMWFyWEZvIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwOTAvIiwic3ViIjoiMDIiLCJpYXQiOjE3Mjg3NTIzOTcsImp0aSI6ImYzMWFkMDcyLWU5N2QtYzExYS1kOTZjLWRiNmUzZjU2NDJlZSIsInBhdF9uYW1lIjoicGF0LTAyLXRNWGV0In0.QrjoeX56E6bygVWyFN1yTezxCVqWm0bsGbdxTTojeb9FWU-_GUEYMtmTgSO3wAVNzcAXcrClv6jsZOaf9MV42Hpyz_c4OyVISrBu3J6dwEae1fym_TxSEPYYgx7LimM_5AB01nnO90g_W4-zfipweMsCNIfTeXOSlXzwqx4eId_ezFR4hsmuoXcFLzLe6zsmN0iW7_y3csgz-GcoJU_xSF02MJ4wJFVPmw1E98xvc1g9j4UKHSDROpd817Z5_KfuLO6wBDFkXFp9NnMo6yc3SOVsOncpPYLIPNSZJYjcGATn2qzryJEnhzCjWF3n8nivt5XY7JKM8LMQgwFGFKoQY9UNs5b1rgjp7KbNf77hHNi2PFXkUtUofkuGPlilnTp4Ftbyj14sc-YzvlWZ5FBlt-vYZO9ERi-Bvj2YVB34PMVkbkTCM0hsHmw8ZXBp7-a6z26GrNLyiuII6bE-E-lpXaUGjGi23MeQl-YlQD5rOnZFUHCuErRZbMLwY7-lUgUWe2NAD4z6sQ9Q6gVglHZuipt4HZlx3tmCpz2l-xAtiwIyArq-c1LBbjJmxsfdhYWKveTVNjgWV2oRToIx_qAC69JYLvCn3EbTPUTnpGxFTKb6QRob4gHZ9ztvmmilXtdvgHIXnFUHJw4xFApqjLQIxP1Dc-3jewV5Ff00vsS9Y-k"
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
                publishTime: new Date(2018, 5, 3, 10, 0, 0).toISOString()
            },
            status: {
                phase: "PUBLISHED",
                lastModifyTime: new Date(2018,5,3,10,0,0).toISOString(),
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

