module.exports = {
  up: async (query, DataTypes) => {
    await query.createTable('cmd_category', {
      id: {
        type: DataTypes.BIGINT,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: async (query) => {
    await query.dropTable('cmd_category');
  },
};
