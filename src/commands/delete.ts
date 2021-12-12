import type { Arguments, CommandBuilder } from 'yargs';

type Options = {
  email: string;
  endpoint: string;
  password: string;
  auth: string;
};

export const command: string = 'delete <email> <password>';
export const desc: string = 'Delete the user with email address <email>';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      endpoint: { type: 'string', default: 'http://localhost:8080', alias: 'e', describe: 'The endpoint used to connect to Thunder' },
      auth: { type: 'string', default: 'application:secret', alias: 'a', describe: 'Basic authentication credentials' }
    })
    .positional('email', { type: 'string', demandOption: true, describe: 'The email address of the user to delete' })
    .positional('password', { type: 'string', demandOption: true, describe: 'The password of the user to delete' })
    .example('$0 delete test@test.com password', '');

export const handler = (argv: Arguments<Options>): void => {
  const { email, endpoint, password, auth } = argv;

  let authUser = auth.split(":")[0];
  let authPass = auth.split(":")[1];

  const ThunderClient = require('thunder-client');
  let thunder = new ThunderClient(endpoint, authUser, authPass);

  thunder.deleteUser(email, password, (err: Error, statusCode: any, result: any) => {
    if (err) {
      process.stderr.write(`[ERROR CODE ${statusCode}] ${result}`);
    } else {
      process.stdout.write(JSON.stringify(result));
    }
  
    process.exit(0);
  });
};
