export interface IConfig {
  gitToken: string;
  token: string;
  webhookSecret: string;

  tempFolder: string;
  appConfigMap: {
    [appName: string]: {
      repository: string;
      namespace: string;
    };
  };
}

export default (): IConfig => ({
  gitToken: process.env.GIT_TOKEN,
  token: process.env.TOKEN,
  webhookSecret: process.env.WEBHOOK_SECRET,

  tempFolder: process.env.TEMP_FOLDER || '/tmp',
  appConfigMap: {
    'finance-project': {
      repository: 'pheliperocha/finance-project',
      namespace: 'finance-project',
    },
    'finance-project-dashboard': {
      repository: 'pheliperocha/finance-project-dashboard',
      namespace: 'finance-project',
    },
    'nfe-reader': {
      repository: 'pheliperocha/nfe-reader',
      namespace: 'finance-project',
    },
  },
});
