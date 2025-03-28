const env = import.meta.env.MODE || 'development';

type Environments = {
  [key: string]: string;
}

const BASE_API_URL_ENVIRONMENTS: Environments = {
  development: "http://localhost:3000/api",
  production: "https://dgtickets-backend-production.up.railway.app/api",
};

const BASE_WS_URL_ENVIRONMENTS: Environments = {
  development: "ws://localhost:3000/ws",
  production: "wss://dgtickets-backend-production.up.railway.app/ws",
};

export const BASE_API_URL = BASE_API_URL_ENVIRONMENTS[env];
export const BASE_WS_URL = BASE_WS_URL_ENVIRONMENTS[env];