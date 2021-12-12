import type { Arguments, CommandBuilder } from 'yargs';

type Options = {
  email: string;
  endpoint: string;
  token: string;
  auth: string;
};

export const command: string = 'verify <email> <token>';
export const desc: string = 'Verify an <email> with the correct <token>';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      endpoint: { type: 'string', default: 'http://localhost:8080', alias: 'e', describe: 'The endpoint used to connect to Thunder' },
      auth: { type: 'string', default: 'application:secret', alias: 'a', describe: 'Basic authentication credentials' }
    })
    .positional('email', { type: 'string', demandOption: true, describe: 'The email address of the user to verify' })
    .positional('token', { type: 'string', demandOption: true, describe: 'The verification token sent via email' })
    .example('$0 verify test@test.com c54e174b-7ff1-4843-a0f8-9792727e9b15', '');

export const handler = (argv: Arguments<Options>): void => {
  const { email, endpoint, token, auth } = argv;

  let authUser = auth.split(":")[0];
  let authPass = auth.split(":")[1];

  const ThunderClient = require('thunder-client');
  let thunder = new ThunderClient(endpoint, authUser, authPass);

  thunder.verifyUser(email, token, (err: Error, statusCode: any, result: any) => {
    if (err) {
      process.stderr.write(`[ERROR CODE ${statusCode}] ${result}`);
    } else {
      process.stdout.write(JSON.stringify(result));
    }
  
    process.exit(0);
  });
};
