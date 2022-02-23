"use strict";

export default function(sequelize, DataTypes) {
    var Tag = sequelize.define("Tag", {
        tagName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 50]
            }
        },
        restricted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    Tag.associate = function(models) {
        Tag.belongsToMany(models.Story, {through: "StoryTag"});
    };
    return Tag;
};