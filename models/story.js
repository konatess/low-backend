"use strict";

export default function (sequelize, DataTypes) {
    var Story = sequelize.define("Story", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 100]
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 100]
            }
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isFinished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        doneByDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        chooseNotToWarn: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        violence: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        nsfw: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        nonConsent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        characterDeath: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        profanity: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    Story.associate = function(models) {
        Story.belongsTo(models.User, {as: "Author", sourceKey: "id"});
        Story.belongsToMany(models.Tag, {through: "StoryTag"});
        Story.belongsToMany(models.User, {through: "FaveStories"});
        Story.hasMany(models.Page), {as: "Pages", foreignKey: "StoryId"};
        Story.hasMany(models.Link), {as: "Links", foreignKey: "StoryId"};
    };
    return Story;
};