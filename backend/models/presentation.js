const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Presentation = sequelize.define('Presentation', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        creator_nickname: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return Presentation;
};