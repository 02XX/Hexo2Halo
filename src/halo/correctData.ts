import { version } from "os";
import { DataTypes, Model, Op, Sequelize } from "sequelize";
import { HexoPost } from "../hexo/hexo-entities.js";
import { Post, PostSpec } from "@halo-dev/api-client";

interface ExtensionAttributes {
    name: string;
    data: Buffer;
    version: string;
}
class Extension extends Model<ExtensionAttributes> implements ExtensionAttributes {
    public name!: string;
    public data!: Buffer
    public version!: string;
}


const sequelize = new Sequelize('halo', 'halo', '19991120', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432 // PostgreSQL 默认端口
});

// 测试连接
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const extension = sequelize.define('extensions', {
    name:{
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    data:{
        type: DataTypes.JSONB,
        allowNull: false
    },
    version:{
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
})


var posts: Extension[] = await extension.findAll({
    where: {
        name: {
            [Op.like]: '/registry/content.halo.run/posts/%'
        }
    }
}) as Extension[];

export const correctData = async (hexoPosts: Array<HexoPost>) => {
    for (const post of posts) {
        var data : Post = JSON.parse(post.data.toString())
        var hexoPost = hexoPosts.find(item=>item.formatter.title == data.spec.title)
        if(hexoPost != undefined)
        {
            if (hexoPost.formatter.date)
            {
                data.spec.publishTime = hexoPost.formatter.date.toISOString()
            }
            data.status?.conditions?.forEach(item => {
                if (hexoPost && hexoPost.formatter.date) {
                    item.lastTransitionTime = hexoPost.formatter.date.toISOString();
                }
            })
            if(hexoPost.formatter.updated)
            {
                data.status!.lastModifyTime = hexoPost.formatter.updated.toISOString();
            }
        }
    }
}
