import { setupServer } from &apos;msw/node&apos;;
import { handlers } from &apos;./handlers&apos;;

// Setup requests interception using the given handlers
export const server = setupServer(...handlers); 