const prisma = require("../prisma/prismaClient");

class UsersRepository {
  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(data) {
    return prisma.user.create({ data });
  }

  async updateUser(id, data) {
    return prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id) {
    return prisma.user.delete({ where: { id } });
  }
}

module.exports = new UsersRepository();
