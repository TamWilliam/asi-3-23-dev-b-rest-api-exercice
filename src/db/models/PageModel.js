import BaseModel from "./BaseModel.js"
import hashPassword from "../hashPassword.js"
import RoleModel from "./RoleModel.js"

class UserModel extends BaseModel {
  static tableName = "pages"

  async setPassword(password) {
    const [passwordHash, passwordSalt] = await hashPassword(password)
    this.passwordHash = passwordHash
    this.passwordSalt = passwordSalt
  }

  async verifyPassword(password) {
    const hash = await hashPassword(password, this.passwordSalt)
    return this.passwordHash === hash
  }

  static relationMappings() {
    return {
      role: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: RoleModel,
        join: {
          from: "users.roleId",
          to: "roles.id",
        },
      },
    }
  }
}

export default UserModel
