export interface IAppConfigMap {
  [appName: string]: {
    repository: string;
    namespace: string;
    /** Deploy into exactly `namespace` instead of `<namespace>-<target>`. */
    fixedNamespace?: boolean;
    /** Helm release name instead of `<app>-<target>`, to adopt a release that already exists. */
    releaseName?: string;
    allowedUsers: { id: number; login: string }[];
  };
}

export interface IConfig {
  gitToken: string;
  token: string;
  webhookSecret: string;
  ntfyToken: string;

  tempFolder: string;
  appConfigMap: IAppConfigMap;
}

// TODO: Valid that the envs are properly setted
export default (): IConfig => ({
  gitToken: process.env.GIT_TOKEN,
  token: process.env.TOKEN,
  webhookSecret: process.env.WEBHOOK_SECRET,
  ntfyToken: process.env.NTFY_TOKEN,

  tempFolder: process.env.TEMP_FOLDER || '/tmp',
  appConfigMap: {
    'finance-project': {
      repository: 'pheliperocha/finance-project',
      namespace: 'finance-project',
      allowedUsers: [{ id: 6820528, login: 'pheliperocha' }],
    },
    'finance-project-dashboard': {
      repository: 'pheliperocha/finance-project-dashboard',
      namespace: 'finance-project',
      allowedUsers: [{ id: 6820528, login: 'pheliperocha' }],
    },
    'nfe-reader': {
      repository: 'pheliperocha/nfe-reader',
      namespace: 'finance-project',
      allowedUsers: [{ id: 6820528, login: 'pheliperocha' }],
    },
    lastro: {
      repository: 'pheliperocha/lastro',
      namespace: 'lastro',
      fixedNamespace: true,
      releaseName: 'lastro',
      allowedUsers: [{ id: 6820528, login: 'pheliperocha' }],
    },
    'skill-graph': {
      repository: 'pheliperocha/skill_graph',
      namespace: 'skill-graph',
      allowedUsers: [{ id: 6820528, login: 'pheliperocha' }],
    },
  },
});
