module.exports = {
  up: async (query, DataTypes) => {
    await query.createTable('channel_auth', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      server_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'server',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM('permitted', 'excluded'),
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
    await query.dropTable('channel_auth');
  },
};
