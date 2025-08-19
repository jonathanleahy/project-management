import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql',
  credentials: 'include', // Important for cookies
})

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`)
  }
})

// Combine links
const link = ApolloLink.from([errorLink, httpLink])

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      Task: {
        fields: {
          children: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
        },
      },
      Project: {
        fields: {
          tasks: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
          members: {
            merge(existing = [], incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})