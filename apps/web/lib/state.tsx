// src/context/state.js
import { showNotification } from '@mantine/notifications';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { IconCheck as Check, IconX as X } from '@tabler/icons';
import { useGetConfigLazyQuery } from '@homarr/graphql';
import { Config } from './types';

type configContextType = {
  config: Config;
  setConfig: (newconfig: Config) => void;
  loadConfig: (name: string) => void;
  getConfigs: () => Promise<string[]>;
};

const configContext = createContext<configContextType>({
  config: {
    name: 'default',
    services: [],
    settings: {
      searchUrl: 'https://google.com/search?q=',
    },
    modules: {},
  },
  setConfig: () => {},
  loadConfig: async (name: string) => {},
  getConfigs: async () => [],
});

export function useConfig() {
  const context = useContext(configContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

type Props = {
  children: ReactNode;
};

export function ConfigProvider({ children }: Props) {
  const [getConfigsQuery] = useGetConfigLazyQuery();

  const [config, setConfigInternal] = useState<Config>({
    name: 'default',
    services: [],
    settings: {
      searchUrl: 'https://www.google.com/search?q=',
    },
    modules: {},
  });

  useEffect(() => {
    loadConfig('default');
  }, []);

  async function loadConfig(configName: string) {
    try {
      const response = await getConfigsQuery({ variables: { configName } });

      if (!response.data) {
        throw new Error(response.error?.message);
      }

      setConfigInternal(response.data?.config as any); // TODO: FIX
      showNotification({
        title: 'Config',
        icon: <Check />,
        color: 'green',
        autoClose: 1500,
        radius: 'md',
        message: `Loaded config : ${configName}`,
      });
    } catch (error) {
      showNotification({
        title: 'Config',
        icon: <X />,
        color: 'red',
        autoClose: 1500,
        radius: 'md',
        message: `Error loading config : ${configName}`,
      });
    }
  }

  function setConfig(newconfig: Config) {
    // axios.put(`/api/configs/${newconfig.name}`, newconfig);
    // setConfigInternal(newconfig);
  }

  async function getConfigs(): Promise<string[]> {
    // const response = await axios.get('/api/configs');
    // return response.data;

    return ['default'];
  }

  const value = {
    config,
    setConfig,
    loadConfig,
    getConfigs,
  };
  return <configContext.Provider value={value}>{children}</configContext.Provider>;
}