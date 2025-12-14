export const typeDefs = `
  type Library @node {
    name: String! @unique
    version: String!
    description: String
    repository: String
    dependencies: [Library!]! @relationship(type: "DEPENDS_ON", direction: OUT)
    dependents: [Library!]! @relationship(type: "DEPENDS_ON", direction: IN)
    categories: [Category!]! @relationship(type: "BELONGS_TO", direction: OUT)
    frameworks: [Framework!]! @relationship(type: "TARGETS", direction: OUT)
    maintainers: [Author!]! @relationship(type: "MAINTAINED_BY", direction: OUT)
    alternatives: [Library!]! @relationship(type: "ALTERNATIVE_TO", direction: OUT)
  }

  type Category @node {
    name: String! @unique
    description: String
    libraries: [Library!]! @relationship(type: "BELONGS_TO", direction: IN)
  }

  type Framework @node {
    name: String! @unique
    version: String
    libraries: [Library!]! @relationship(type: "TARGETS", direction: IN)
  }

  type Author @node {
    name: String! @unique
    url: String
    libraries: [Library!]! @relationship(type: "MAINTAINED_BY", direction: IN)
  }

  type Query {
    library(name: String!): Library @cypher(
      statement: """
      MATCH (l:Library {name: $name})
      RETURN l
      """,
      columnName: "l"
    )
  }
`;
