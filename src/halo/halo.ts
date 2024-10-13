import {
    coreApiClient,
    consoleApiClient,
    ucApiClient,
    publicApiClient,
    createCoreApiClient,
    createConsoleApiClient,
    createUcApiClient,
    createPublicApiClient,
    axiosInstance,
    DetailedUser,
    PostRequest,
    Category,
    Tag,
    Group,
    ListedPost
} from "@halo-dev/api-client"
import { randomUUID } from 'crypto';
import limax from 'limax';
import fs from "fs"
import { HexoPost, HexoPostImage } from "../hexo/hexo-entities.js";
import markdownit from 'markdown-it'
import MarkdownIt from "markdown-it";
import { katex } from '@mdit/plugin-katex'
import { group } from "console";
export class Halo
{
    user: DetailedUser
    markdownIt : MarkdownIt = new markdownit().use(katex)
    constructor(site:string, token:string)
    {
        if(site == "" || token == "")
        {
            throw new Error("site or token is empty")
        }
        this.user = {} as DetailedUser;
        axiosInstance.defaults.baseURL = site
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
    async initialize() {
        this.user = (await consoleApiClient.user.getCurrentUserDetail()).data
    }
    async CreateCategoryFormHexo(hexoPost: HexoPost) : Promise<Array<Category>>
    {
        let categoryReturn = new Array<Category>()

        for (let categories of hexoPost.formatter.categories)
        {
            let childrenCategory: Category | null = null
            const reversedCategories = categories.reverse();
            for (let category of reversedCategories)
            {
                const categoryData = await coreApiClient.content.category.listCategory()
                const categoryList = categoryData.data.items
                let categoryDataItem = categoryList.find((item) => item.spec.displayName === category) 
                
                if (categoryDataItem == undefined)
                {
                    const data = await coreApiClient.content.category.createCategory({
                        category: {
                            apiVersion: "content.halo.run/v1alpha1",
                            kind: "Category",
                            metadata: {
                                name: randomUUID(),
                                creationTimestamp: new Date().toISOString(),
                            },
                            spec: {
                                displayName: category,
                                priority: 0,
                                slug: limax(category, { tone: false }),
                                cover: "",
                                description: "",
                                template: "",
                                children: childrenCategory == null ? [] : [childrenCategory.metadata.name],
                                preventParentPostCascadeQuery: false,
                                hideFromList: false,
                            }
                        }
                    })
                    categoryReturn.push(data.data)
                    childrenCategory = data.data
                }
                else
                {
                    if (childrenCategory != null)
                    {
                        categoryDataItem.spec.children!.push(childrenCategory.metadata.name)
                    }  
                    const update = await coreApiClient.content.category.updateCategory({name: categoryDataItem.metadata.name, category: categoryDataItem})
                    categoryReturn.push(update.data)
                    childrenCategory = update.data
                }
            }
        }
        return categoryReturn
    }
    async UploadImageFromHexo(hexoPostImage: HexoPostImage)
    {
        const data = await coreApiClient.storage.group.listGroup()
        const groups = data.data.items
        let group = groups.find((item) => item.spec.displayName == hexoPostImage.group)
        if(group == undefined)
        {
            group = (await coreApiClient.storage.group.createGroup({
                group: {
                    apiVersion: "storage.halo.run/v1alpha1",
                    kind: "Group",
                    metadata: {
                        name: randomUUID(),
                        creationTimestamp: new Date().toISOString(),
                    },
                    spec: {
                        displayName: hexoPostImage.group,
                    }
                }
            })).data
        }
        //图片是否存在
        const attachments = (await coreApiClient.storage.attachment.listAttachment()).data.items
        if(attachments.find((item) => item.spec.displayName == hexoPostImage.name) != undefined)
        {
            console.log(`Skip upload image ${hexoPostImage.name}`)
            return
        }
        await consoleApiClient.storage.attachment.uploadAttachment({
            file: new File([hexoPostImage.buffer], hexoPostImage.name),
            policyName:"default-policy",
            groupName: group.metadata.name
        })
    }
    async CreateTagFromHexo(hexoPost: HexoPost) : Promise<Array<Tag>>
    {
        const tagReturn = new Array<Tag>()
        const tagData = await coreApiClient.content.tag.listTag()
        for (let tag of hexoPost.formatter.tags)
        {
            let tagDataItem = tagData.data.items.find((item) => item.spec.displayName == tag)
            if (tagDataItem == undefined)
            {
                const data = await coreApiClient.content.tag.createTag({
                    tag: {
                        apiVersion: "content.halo.run/v1alpha1",
                        kind: "Tag",
                        metadata: {
                            name: randomUUID(),
                            creationTimestamp: new Date().toISOString(),
                        },
                        spec: {
                            displayName: tag,
                            slug: limax(tag, { tone: false }),
                            cover: "",
                            color: "#FFFFFF",
                        }
                    }
                })
                tagReturn.push(data.data)
            }
            else
            {
                tagReturn.push(tagDataItem)
            }
        }
        return tagReturn
    }
    async CreatePostFormHexo(hexoPost: HexoPost)
    {
        //文章是否存在
        const posts = (await consoleApiClient.content.post.listPosts()).data.items
        if (posts.find((item) => item.post.spec.title == hexoPost.formatter.title) != undefined) {
            console.log(`Skip upload post ${hexoPost.formatter.title}`)
            return
        }
        const categories = await this.CreateCategoryFormHexo(hexoPost)
        const tags = await this.CreateTagFromHexo(hexoPost)
        const data = await consoleApiClient.content.post.draftPost({
            postRequest: {
                        post: {
                            spec: {
                                title: hexoPost.formatter.title,
                                slug: limax(hexoPost.formatter.title, { tone: false }),
                                owner: this.user.user.metadata.name,
                                // template: "",
                                // cover: "",
                                deleted: false,
                                publish: true,
                                pinned: false,
                                allowComment: true,
                                visible: "PUBLIC",
                                priority: 0,
                                excerpt: {
                                    autoGenerate: hexoPost.brief == "",
                                    raw: hexoPost.brief,
                                },
                                categories: categories.map((item) => item.metadata.name),
                                tags: tags.map((item) => item.metadata.name),
                                htmlMetas: [
                                ],
                                publishTime: hexoPost.formatter.date?.toISOString() ?? new Date().toISOString(),
                            },
                            apiVersion: "content.halo.run/v1alpha1",
                            kind: "Post",
                            metadata: {
                                name: randomUUID(),
                                creationTimestamp: hexoPost.formatter.date?.toISOString() ?? new Date().toISOString(),
                            },
                        },
                        content: {
                            raw: hexoPost.content,
                            rawType: "markdown",
                            content: this.markdownIt.render(hexoPost.content),
                }
            }
        })
    }
    async UpdatePostFormHexo(hexoPost: HexoPost)
    {
        //文章是否存在
        const posts = (await consoleApiClient.content.post.listPosts()).data.items
        let post = posts.find((item) => item.post.spec.title == hexoPost.formatter.title)
        if (post == undefined) {
            console.log(`Skip update post ${hexoPost.formatter.title}`)
            return
        }
        const categories = await this.CreateCategoryFormHexo(hexoPost)
        const tags = await this.CreateTagFromHexo(hexoPost)
        post.post.spec.allowComment = hexoPost.formatter.comments
        post.post.spec.categories = categories.map((item) => item.metadata.name)
        post.post.spec.tags = tags.map((item) => item.metadata.name)
        post.post.spec.excerpt.raw = hexoPost.brief
        post.post.spec.publish = true
        await consoleApiClient.content.post.updateDraftPost({
            name: post.post.metadata.name,
            postRequest:{
                post: post.post,
                content: {
                    raw: hexoPost.content,
                    rawType: "markdown",
                    content: this.markdownIt.render(hexoPost.content),
                }
            }
        })
        await consoleApiClient.content.post.publishPost({name: post.post.metadata.name})
    }
    async CreatePostFormHalo(inluceDeleted: boolean = false): Promise<Array<HexoPost>>
    {
        const data = await consoleApiClient.content.post.listPosts()
        const posts = data.data.items
        let hexoPosts = new Array<HexoPost>()
        for (let post of posts)
        {
            if(post.post.spec.deleted == true && inluceDeleted == false)
            {
                console.log(`Skip deleted post ${post.post.metadata.name} ${post.post.spec.title}` )
                continue
            }
            if(post.post.spec.headSnapshot == undefined)
            {
                throw new Error("Post headSnapshot is undefined")
            }
            const data2 = await consoleApiClient.content.post.fetchPostContent({name: post.post.metadata.name, snapshotName: post.post.spec.headSnapshot})
            const postContent = data2.data
            hexoPosts.push({
                formatter: {
                    title: post.post.spec.title,
                    tags: await this.formatHaloTag(post.post.spec.tags ?? []) ,
                    categories: await this.formatHaloCategory(post.post.spec.categories ?? []),
                    date: post.post.metadata.creationTimestamp ? new Date(post.post.metadata.creationTimestamp) : new Date(),
                    updated: post.post.status?.lastModifyTime ? new Date(post.post.status.lastModifyTime) : new Date(),
                    comments: post.post.spec.allowComment,
                },
                brief: post.post.spec.excerpt.raw ?? "",
                content: postContent.raw ?? "",
            })
        }
        return hexoPosts
    }
    async CreatePostImageFromHalo(haloPath: string) : Promise<Array<HexoPostImage>>
    {
        let postImageReturn = new Array<HexoPostImage>()
        const groups = (await coreApiClient.storage.group.listGroup()).data.items
        const attachments = (await coreApiClient.storage.attachment.listAttachment()).data.items
        let hexoPostImages = new Array<HexoPostImage>()
        for (let attachment of attachments)
        {
            const group = groups.find((item) => item.metadata.name == attachment.spec.groupName)
            if(group == undefined || attachment.spec.displayName == undefined)
            {
                throw new Error("Group/attachment not found")
            }
            const buffer = fs.readFileSync(`${haloPath}/${attachment.spec.displayName}`)
            postImageReturn.push({
                name: attachment.spec.displayName,
                group: group.spec.displayName,
                buffer: buffer
            })
        }
        return postImageReturn
    }
    async formatHaloTag(tags: Array<string>): Promise<Array<string>>
    {
        const data = await coreApiClient.content.tag.listTag()
        const tagsData = data.data
        const tagsFilter = tagsData.items.filter((item) => tags.includes(item.metadata.name))
        return tagsFilter.map((item) => item.spec.displayName);
    }
    async formatHaloCategory(categories: Array<string>) : Promise<Array<Array<string>>>
    {
        const data = await coreApiClient.content.category.listCategory()
        const categoriesData = data.data
        const categoriesFilter = categoriesData.items.filter((item) => categories.includes(item.metadata.name))
        let categoryReturn = new Array<Array<Category>>()
        let noSubcatrgory = categoriesFilter.filter(item=>item.spec.children?.length == 0)
        let hasSubcatrgory = categoriesFilter.filter(item=>item.spec.children?.length != 0)
        for(let category of noSubcatrgory)
        {
            categoryReturn.push([category])
        }
        for(let category of hasSubcatrgory)
        {
            for(let subcategory of category.spec.children!)
            {
                for(let i = 0; i < categoryReturn.length; i++)
                {
                    if(categoryReturn[i].find((item)=>item.metadata.name == subcategory) != undefined)
                    {
                        categoryReturn[i].push(category)
                    }
                }
            }
        }
        return categoryReturn.map((item) => item.reverse().map((item2) => item2.spec.displayName));
    }
}



