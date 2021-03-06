"use strict";

export default function(sequelize, DataTypes) {
    var Link = sequelize.define("Link", {
        linkName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        }
    });
    Link.associate = function(models) {
        Link.belongsTo(models.User, {as: "Author", sourceKey: "id"});
        Link.belongsTo(models.Story, {as: "Story", sourceKey: "id"});
        Link.belongsTo(models.Page, {as: "FromPage", sourceKey: "id"});
        Link.belongsTo(models.Page, {as: "ToPage", sourceKey: "id"});
    };
    return Link;
};
