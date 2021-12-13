module.exports = {
  up: async (query, DataTypes) => {
    await query.createTable('command', {
      id: {
        type: DataTypes.BIGINT,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'cmd_category',
          key: 'id',
        },
      },
      name: {
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
    await query.dropTable('command');
  },
};
