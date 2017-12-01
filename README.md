# MobX sideways data loading API


### Tech:
- MobX
- graphQL?

- [gql-to-mobx](https://github.com/mhaagens/gql-to-mobx)
- [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)
  - [Blogpost](https://codeburst.io/the-curious-case-of-mobx-state-tree-7b4e22d461f)
- [mobx-apollo](https://www.npmjs.com/package/mobx-apollo)

### Ideas:
Resources manage the individual datasets (observable)

API -> set(models)
  resource.filter -> set(models)

Related properties should be resolved through resources.
 * displayed (either in react or as string) in a loading state
 * errors should also be kept in this 'proxy' object

 - loading prop on these objects.
 - special Symbol('api-state') for storing the resolve state.