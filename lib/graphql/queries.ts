import { gql } from '@apollo/client';

export const GET_LIBRARIES = gql`
  query GetLibraries {
    libraries {
      name
      version
      description
      repository
      categories {
        name
      }
      frameworks {
        name
      }
      maintainers {
        name
      }
    }
  }
`;

export const GET_LIBRARY_DETAILS = gql`
  query GetLibraryDetails($name: String!) {
    libraries(where: { name: $name }) {
      name
      version
      description
      repository
      dependencies {
        name
        version
        description
      }
      dependents {
        name
        version
      }
      categories {
        name
        description
      }
      frameworks {
        name
        version
      }
      maintainers {
        name
        url
      }
      alternatives {
        name
        version
        description
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      name
      description
      libraries {
        name
        version
      }
    }
  }
`;

export const CREATE_LIBRARY = gql`
  mutation CreateLibrary(
    $name: String!
    $version: String!
    $description: String
    $repository: String
  ) {
    createLibraries(
      input: [{
        name: $name
        version: $version
        description: $description
        repository: $repository
      }]
    ) {
      libraries {
        name
        version
        description
        repository
      }
    }
  }
`;
