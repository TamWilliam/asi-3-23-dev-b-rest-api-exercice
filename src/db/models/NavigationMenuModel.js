import BaseModel from "./BaseModel.js"

class NavigationMenuModel extends BaseModel {
  static tableName = "navigationMenu"

  static jsonSchema = {
    type: "object",
    required: ["name", "menuItems"],

    properties: {
      id: { type: "integer" },
      name: { type: "string", minLength: 1, maxLength: 255 },
      content: { type: "string" },
      menuItems: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "url"],
          properties: {
            id: { type: "integer" },
            title: { type: "string", minLength: 1, maxLength: 255 },
            url: { type: "string", format: "uri" },
          },
        },
      },
    },
  }
}

export default NavigationMenuModel
