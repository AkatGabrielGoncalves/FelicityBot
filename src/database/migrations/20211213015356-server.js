module.exports = {
  up: async (query, DataTypes) => {
    await query.createTable('server', {
      id: {
        type: DataTypes.BIGINT,
        unique: true,
        primaryKey: true,
        allowNull: false,
      },
      prefix: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '!',
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
    await query.dropTable('server');
  },
};
