"use strict";

export default function (sequelize, DataTypes) {
    var Page = sequelize.define("Page", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: [1, 5000]
            }
        },
        isStart: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isTBC: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isEnding: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isLinked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isOrphaned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        contentFinished: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });
    Page.associate = function (models) {
        Page.belongsTo(models.User, { as: "Author" });
        Page.belongsTo(models.Story, { as: "Story" });
        Page.hasMany(models.Link, {as: "ParentLinks", foreignKey: "ToPageId"});
        Page.hasMany(models.Link, {as: "ChildLinks", foreignKey: "FromPageId"})
    };
    return Page;
};