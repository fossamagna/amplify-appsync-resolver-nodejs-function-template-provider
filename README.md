# AWS Amplify AppSync Resolver NodeJS function templates plugin

<!-- ABOUT THE PROJECT -->
## About The Project

This project is amplify plugin Node.js function template for AppSync Lambda Resolver.

For additional details on Lambda resolvers, see the AWS Amplify CLI API(GraphQL) [docs](https://docs.amplify.aws/cli/graphql-transformer/function).


## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

First, install AWS Amplify CLI using npm (we assume you have pre-installed node.js).

```sh
npm install -g @aws-amplify/cli
```

### Installation

1. Install NPM packages
   ```sh
   npm install -g amplify-appsync-resolver-nodejs-function-template-provider
   ```
2. Enable this plugin
   ```sh
   amplify plugin scan
   ```

For additional details on plugins, see the AWS Amplify CLI plugins [docs](https://docs.amplify.aws/cli/usage/plugin).

## Usage

Once installed, you can use this plugin to generate Amplify AppSync Lambda resolvers for you:

- Run `amplify add function` to add a new Lambda Resolver to AppSync API.
  ![Usage](https://user-images.githubusercontent.com/1638848/142107458-0a949a22-0c7b-46a4-ba35-2f6fd8ce5692.gif)

- Edit `schema.graphql`, to relate selected fields in the previous step to `@function` directive.
  ```graphql
  type Blog @model {
    id: ID!
    name: String! @function(name: "resolver-${env}") # added here
    posts: [Post] @connection(keyName: "byBlog", fields: ["id"])
  }

  type Post @model @key(name: "byBlog", fields: ["blogID"]) {
    id: ID!
    title: String! @function(name: "resolver-${env}") # added here
    blogID: ID!
    blog: Blog @connection(fields: ["blogID"])
    comments: [Comment] @connection(keyName: "byPost", fields: ["id"])
  }

  type Comment @model @key(name: "byPost", fields: ["postID", "content"]) {
    id: ID!
    postID: ID!
    post: Post @connection(fields: ["postID"])
    content: String!
  }
  ```

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the Apache-2.0 License. See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

Masahiko MURAKAMI - [@fossamagna](https://twitter.com/fossamagna)

Project Link: [https://github.com/fossamagna/amplify-appsync-resolver-nodejs-function-template-provider](https://github.com/fossamagna/amplify-appsync-resolver-nodejs-function-template-provider)