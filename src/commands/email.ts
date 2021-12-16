import type { Arguments, CommandBuilder } from 'yargs';

type Options = {
  email: string;
  endpoint: string;
  password: string;
  auth: string;
};

export const command: string = 'email <email> <password>';
export const desc: string = 'Send a verification email to the given user';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      endpoint: { type: 'string', default: 'http://localhost:8080', alias: 'e', describe: 'The endpoint used to connect to Thunder' },
      auth: { type: 'string', default: 'application:secret', alias: 'a', describe: 'Basic authentication credentials' }
    })
    .positional('email', { type: 'string', demandOption: true, describe: 'The email address of the user to email' })
    .positional('password', { type: 'string', demandOption: true, describe: 'The password of the user to email' })
    .example('$0 email test@test.com password', '');

export const handler = (argv: Arguments<Options>): void => {
  const { email, endpoint, password, auth } = argv;

  let authUser = auth.split(":")[0];
  let authPass = auth.split(":")[1];

  const ThunderClient = require('thunder-client');
  let thunder = new ThunderClient(endpoint, authUser, authPass);

  thunder.sendEmail(email, password, (err: Error, statusCode: any, result: any) => {
    if (err) {
      process.stderr.write(`[ERROR CODE ${statusCode}] ${result}`);
      process.exit(1);
    } else {
      process.stdout.write(JSON.stringify(result));
      process.exit(0);
    }
  });
};
