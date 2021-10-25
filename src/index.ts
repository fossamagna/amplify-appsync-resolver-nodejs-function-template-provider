import { FunctionTemplateContributorFactory } from 'amplify-function-plugin-interface';
import { provideResolver } from './providers/resolverProvider';

export const functionTemplateContributorFactory: FunctionTemplateContributorFactory = (context) => {
  return {
    contribute: (request) => {
      switch (request.selection) {
        case 'resolver': {
          return provideResolver(context);
        }
        default: {
          throw new Error(`Unknown template selection [${request.selection}]`);
        }
      }
    }
  }
};
