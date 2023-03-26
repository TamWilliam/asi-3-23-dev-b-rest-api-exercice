import BaseModel from "./BaseModel.js"

class RoleModel extends BaseModel {
  static tableName = "roles"

  static modifiers = {
    paginate: (query, limit, page) => {
      return query.limit(limit).offset((page - 1) * limit)
    },
  }
}

export default RoleModel
