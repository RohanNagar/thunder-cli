import type { Arguments, CommandBuilder } from 'yargs';

type Options = {
  email: string;
  endpoint: string;
  password: string;
  auth: string;
  user: string | undefined;
  file: string | undefined;
};

export const command: string = 'update <email> <password>';
export const desc: string = 'Update user details for email address <email>';

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      endpoint: { type: 'string', default: 'http://localhost:8080', alias: 'e', describe: 'The endpoint used to connect to Thunder' },
      auth: { type: 'string', default: 'application:secret', alias: 'a', describe: 'Basic authentication credentials' },
      file: { type: 'string', alias: 'f', conflicts: 'user', describe: 'A path to a JSON file describing the user to create', coerce: (arg) => {
        if (!arg) return undefined;
        return JSON.parse(require('fs').readFileSync(arg, { encoding: 'utf8', flag: 'r' }))
      }},
      user: { type: 'string', alias: 'u', conflicts: 'file', describe: 'A JSON string describing the user to create', coerce: (arg) => {
        if (!arg) return undefined;
        return JSON.parse(arg)
      }}
    })
    .positional('email', { type: 'string', demandOption: true, describe: 'The current email address of the user to update' })
    .positional('password', { type: 'string', demandOption: true, describe: 'The current password of the user to update' })
    .check((argv) => {
      if (argv.user || argv.file) {
         return true;
      } else {
         throw new Error('Error: pass either user or file option to update a user');
      }
    })
    .example('$0 update test@test.com password -u \'{ "email": { "address": "test@test.com" }, "password": "secret" }\'', 'Update a user with inline JSON')
    .example('$0 update test@test.com password -f user.json', 'Update a user with a JSON file');

export const handler = (argv: Arguments<Options>): void => {
  const { email, endpoint, password, auth, user, file } = argv;

  let finalUser = user ? user : file;
  let authUser = auth.split(":")[0];
  let authPass = auth.split(":")[1];

  const ThunderClient = require('thunder-client');
  let thunder = new ThunderClient(endpoint, authUser, authPass);

  thunder.updateUser(email, password, finalUser, (err: Error, statusCode: any, result: any) => {
    if (err) {
      process.stderr.write(`[ERROR CODE ${statusCode}] ${result}`);
      process.exit(1);
    } else {
      process.stdout.write(JSON.stringify(result));
      process.exit(0);
    }
  });
};
