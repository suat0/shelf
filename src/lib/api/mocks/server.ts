import {setupServer} from 'msw/native';
import {handlers} from 'src/lib/api/mocks/handlers';

export const server = setupServer(...handlers);
