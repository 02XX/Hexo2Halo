import { DataTypes, Model, Op, Sequelize } from "sequelize";
import { HexoPost } from "../hexo/hexo-entities.js";
import { Post, PostSpec, Snapshot } from "@halo-dev/api-client";


interface ExtensionAttributes {
    name: string;
    data: Buffer;
    version: string;
}

class Extension extends Model<ExtensionAttributes> implements ExtensionAttributes {
    public name!: string;
    public data!: Buffer;
    public version!: string;
}

const sequelize = new Sequelize('halo', 'halo', '19991120', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432
});

export const correctData = async (hexoPosts: Array<HexoPost>) => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        return;
    }

    // 定义模型
    const extension = sequelize.define('extensions', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        data: {
            type: DataTypes.BLOB,
            allowNull: false
        },
        version: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        createdAt: false,
        updatedAt: false,
    });

    
    // 查询符合条件的记录
    const posts: Extension[] = await extension.findAll({
        where: {
            name: {
                [Op.like]: '/registry/content.halo.run/posts/%'
            }
        }
    }) as Extension[];

    const snapshots = await extension.findAll({
        where: {
            name: {
                [Op.like]: '/registry/content.halo.run/snapshots/%'
            }
        }
    })  as Extension[];

    for(const hexoPost of hexoPosts)
    {
        console.log(`开始同步文章: ${hexoPost.formatter.title}的时间`);
        //post
        var post = posts.find(item => JSON.parse(item.data.toString()).spec.title === hexoPost.formatter.title);
        if(post)
        {
            const postData : Post = JSON.parse(post.data.toString());
            var snapshot = snapshots.find(item => item.name === `/registry/content.halo.run/snapshots/${postData.spec.baseSnapshot}`);
            if(snapshot)
            {
                const snapshotData : Snapshot = JSON.parse(snapshot.data.toString());
                if(hexoPost.formatter.date)
                {
                    postData.spec.publishTime = hexoPost.formatter.date.toISOString();
                    postData.metadata.creationTimestamp = hexoPost.formatter.date.toISOString();
                    snapshotData.metadata.creationTimestamp = hexoPost.formatter.date.toISOString();
                }
                postData.status?.conditions?.forEach(item => {
                    if(hexoPost.formatter.date)
                    {
                        item.lastTransitionTime = hexoPost.formatter.date.toISOString();
                    }
                });
                if(hexoPost.formatter.updated)
                {
                    postData.status!.lastModifyTime = hexoPost.formatter.updated.toISOString();
                    snapshotData.spec.lastModifyTime = hexoPost.formatter.updated.toISOString();
                }
                post.data = Buffer.from(JSON.stringify(postData));
                snapshot.data = Buffer.from(JSON.stringify(snapshotData));
                await post.save();
                await snapshot.save();
            }
        }
    }
};
