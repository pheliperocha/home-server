export interface IAppConfigMap {
  [appName: string]: {
    repository: string;
    namespace: string;
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
  },
});
