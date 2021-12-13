module.exports = {
  up: async (query, DataTypes) => {
    await query.createTable('cmd_role_auth', {
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
      cmd_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'command',
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
    await query.dropTable('cmd_role_auth');
  },
};
