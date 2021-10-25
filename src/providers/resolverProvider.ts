
import * as TransformPackage from 'graphql-transformer-core';
import { $TSContext, exitOnNextTick, ResourceDoesNotExistError } from 'amplify-cli-core';
import { FunctionTemplateParameters } from 'amplify-function-plugin-interface';
import { prompt } from 'enquirer';
import { parse, Kind } from 'graphql'
import * as fs from 'fs';
import * as path from 'path';
import { getDstMap } from '../utils/destFileMapper';

export const templateRoot = `${__dirname}/../../resources`;
const pathToTemplateFiles = path.join(templateRoot, 'lambda/resolver');

type PromptOptions = Parameters<typeof prompt>[0];

type Choice = {
  name: string
  message?: string
  value?: string
  hint?: string
  disabled?: boolean | string
  choices?: Choice[] | string[]
}

type Resolver = {
  name: string;
  fieldResolvers: FieldResolver[]
};

type FieldResolver = {
  name: string;
}

export const provideResolver = async (context: $TSContext): Promise<FunctionTemplateParameters> => {
  const resolvers = await askGraphQLFieldsQuestions(context);
  const files = fs.readdirSync(pathToTemplateFiles);
  return Promise.resolve({
    functionTemplate: {
      sourceRoot: pathToTemplateFiles,
      sourceFiles: files,
      defaultEditorFile: path.join('src', 'index.js'),
      destMap: getDstMap(files),
      parameters: {
        resolvers
      }
    },
  });
}

const askGraphQLFieldsQuestions = async (context: $TSContext): Promise<Resolver[]> => {
  const { allResources } = await context.amplify.getResourceStatus();
  const appSyncResources = allResources.filter((resource: any) => resource.service === 'AppSync');

  let targetResourceName: any;
  if (appSyncResources.length === 0) {
    const errMessage = `
      No AppSync resources have been configured in the API category.
      Please use "amplify add api" command to create a new appsync resource`;
    context.print.error(errMessage);
    await context.usageData.emitError(new ResourceDoesNotExistError(errMessage));
    exitOnNextTick(0);
  } else if (appSyncResources.length === 1) {
    targetResourceName = appSyncResources[0].resourceName;
    context.print.success(`Selected resource ${targetResourceName}`);
  } else {
    const answer = await prompt<{resolverAPIResourceName: string}>({
      type: 'select',
      name: 'resolverAPIResourceName',
      message: 'Choose an API resource to associate with'
    });
    
    targetResourceName = answer.resolverAPIResourceName;
  }

  const backendDir = context.amplify.pathManager.getBackendDirPath();
  const resourceDirPath = path.join(backendDir, 'api', targetResourceName);
  const project = await TransformPackage.readProjectConfiguration(resourceDirPath);
  
  const doc = parse(project.schema);
  const choices: Choice[] = [];
  for (const definition of doc.definitions) {
    if (definition.kind === Kind.OBJECT_TYPE_DEFINITION) {
      const typeName = definition.name;
      const fields = definition.fields || [];
      const choice: Choice = {
        name: typeName.value,
        value: typeName.value,
        choices: fields.map(field => ({
          name: `${typeName.value}.${field.name.value}`,
          value: `${typeName.value}.${field.name.value}`,
          message: field.name.value
        }))
      };
      choices.push(choice);
    }
  }
  
  const filedsQuestions: PromptOptions = {
    type: 'multiselect',
    name: 'fileds',
    message: 'Select fields to associate with lambda resolver',
    choices: choices
  };
  
  const answer = await prompt<{fileds: string[]}>(filedsQuestions);
  const resolverMap = new Map<string, Resolver>();
  answer.fileds.forEach(field => {
    if (!field.includes('.')) {
      return;
    }
    const [typeName, fieldName] = field.split('.');
    if (!resolverMap.has(typeName)) {
      resolverMap.set(typeName, {
        name: typeName,
        fieldResolvers: []
      });
    }
    const resolver = resolverMap.get(typeName);
    resolver?.fieldResolvers?.push({
      name: fieldName,
    })
  });
  return Array.from(resolverMap.values());
}
