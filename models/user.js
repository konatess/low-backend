export default function (sequelize, DataTypes) {
    let User = sequelize.define("User", {
        oAuthKey: {
            type: DataTypes.STRING,
            allowNull: false
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [3, 50]
            }
        }
    });
    User.associate = function(models) {
        User.hasMany(models.Story, {as: "Stories", foreignKey: "AuthorId"});
        User.hasMany(models.Page, {as: "Pages", foreignKey: "AuthorId"});
        User.hasMany(models.Link, {as: "Links", foreignKey: "AuthorId"});
        User.belongsToMany(models.Story, {through: "FaveStories", foreignKey: "ReaderId"});
        User.belongsToMany(models.Page, {through: "Bookmarks", foreignKey: "ReaderId"});
        User.belongsToMany(models.User, {as: "AuthorId", through: "FaveAuthors", foreignKey: "ReaderId", otherKey: "AuthorId"});
    };
    return User;
};