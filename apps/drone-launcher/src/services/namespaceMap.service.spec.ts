import { ConfigService } from '@nestjs/config';
import { IConfig } from '../config/configuration';
import { NamespaceMapService } from './namespaceMap.service';

const service = new NamespaceMapService({
  get: () => ({
    'finance-project': { namespace: 'finance-project' },
    lastro: {
      namespace: 'lastro',
      fixedNamespace: true,
      releaseName: 'lastro',
    },
  }),
} as unknown as ConfigService<IConfig>);

describe('NamespaceMapService.getDeployTarget', () => {
  it('suffixes the namespace and the release with the target by default', () => {
    expect(service.getDeployTarget('finance-project', 'staging')).toEqual({
      namespace: 'finance-project-staging',
      releaseName: 'finance-project-staging',
    });
  });

  it('keeps the namespace and release name an app pins', () => {
    expect(service.getDeployTarget('lastro', 'production')).toEqual({
      namespace: 'lastro',
      releaseName: 'lastro',
    });
  });

  it('refuses any other target for an app with a single namespace', () => {
    expect(() => service.getDeployTarget('lastro', 'staging')).toThrow(
      'only deploys to production',
    );
  });

  it('rejects an unknown app', () => {
    expect(() => service.getDeployTarget('nope', 'staging')).toThrow(
      'App nope not found',
    );
  });
});
